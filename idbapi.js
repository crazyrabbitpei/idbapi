var search = require('./tool/search.js');
var getkey = require('./tool/getkey.js');
var manage = require('./tool/manageidb.js');
var request = require('request');
var http = require('http');
var express = require("express");
var fs =require('fs');
var bodyParser = require('body-parser');
var urlencode = require('urlencode');
var S = require('string');
var child_process = require('child_process');
var querystring = require('querystring');

var list="";

var apikeys = {};

try {
    service = JSON.parse(fs.readFileSync('./data/path'));
    var local = service['import'];
    var fcgi = service['fcgi'];
} 
catch (err) {
    console.error("read service error:"+err);
process.exit(9);
}

try {
    service = JSON.parse(fs.readFileSync('./data/service'));
    var apiip = service['ip'];
    var apiport = service['port'];
} 
catch (err) {
    console.error("read service error:"+err);
process.exit(9);
}

try {
    apikeys = JSON.parse(fs.readFileSync('./data/shadow'));
} 
catch (err) {
    console.error("read shadow error:"+err);
	process.exit(9);
}

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
}));

var server = http.createServer(app);
app.get('/api/getdata',function(req,res){
		fs.readFile('./web/manage/home.php',function(error,data){
			res.end(data);
		});
});
//idb query
//use path name to import
app.all('/api/query/import/local/:dbname/:key',function(req,res){
if (req.method == 'POST') {
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);
		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
	try{
        	var path = req.param('path');
		var test = path.match(/[^\w|^\.]/g);
		if(test!=null){
			console.log("Illegal path:"+path);
			res.end('{"Status":"400 Bad request",\n"Detail":""}');
					
		}
		else{
        	var dbname = req.params.dbname;
		var data = local+path;
		//console.log('./tool/nginx/bin/fcgiClient -M 1 -U http://'+ip+':'+port+'/idb/'+dbname+' -K "@\\n" -R '+data);		
		manage.post(fcgi,data,dbname,ip,port,function(msg){
			var web='';
			msg = msg.replace(/\\\\n/g,"\\n");		
			msg = msg.replace(/\\n/g,"<br\/>");		
			var obj =  JSON.parse(msg);
			var stat = obj.Status;
			var num = obj.Detail[0].DataNums;
			var ini = obj.Detail[1].DBini;
			
			if(search.ifNull(num)!=0||search.ifNull(ini)!=0){
				res.end('{"Status":"404 Not found",\n"Detail":"You can\'t import this source or dbname doesn\'t exist."}');
			}
			else{
 				fs.readFile('./web/status.html',function(error,data){
					data = S(data).replaceAll("{key}",key).s;		
					data = S(data).replaceAll("{dbname}",dbname).s;		
					data = S(data).replaceAll("{status}","Total num:"+num).s;		
					data = S(data).replaceAll("{detail}",ini).s;		
					web+=data;
					res.end(web);
				});
			}
		});
		}
	}
	catch(e){
		res.end('{"Status":"500 Server error",\n"Detail":"Import error:'+e+'"}');
	}
}
else{
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url+", Status:Refused");
	res.end('{"Status":"405 Method Not Allowed",\n"Detail":"Only supports POST."}');
}

});

//import for one or more, and data can out of local
app.post('/api/query/import/:dbname/:key',function(req,res){
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);

		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
        var dbname = req.params.dbname;
	var content='';
		//console.log(req.param('data'));
		try{
			req.on('data', function (data) {
	               		content += data;
	               		 if (content.length > 1e6){//prevent too big
	                	        req.connection.destroy();
	       	        	 }
		        });
		        req.on('end', function () {
				//console.log("from body:"+content);
				/*this can put data in url*/
				/*
				content += '\n';
				cmd = "@\n@id:";
				cmd = "putobject+rechead:"+cmd;
				cmd=urlencode(S(cmd).s);
				content=urlencode(S(content).s);
				manage.send("POST",content,"/idb/"+dbname+"/?cmd="+cmd+"&data="+content,ip,port,function(result){
					if(result==''){
						res.end('{"Status":"404 Not found",\n"Detail":"dbname doesn\'t exist"}');
					}
					else{
						res.end(result);
					}
				});
				*/
				/*-------------------------*/
				/*only put data in body, will have some problem in chinese */
				
				cmd = "@\n";
				cmd=urlencode(S(cmd).s);
				cmd = "rechead="+cmd;
				manage.send("PUTOBJ",content,"/idb/"+dbname+"/?"+cmd,ip,port,function(result){
					if(result==''){
						res.end('{"Status":"404 Not found",\n"Detail":"dbname doesn\'t exist"}');
					}
					else{
						res.end(result);
					}
				});
				
				/*-------------------------*/
			});
		}
		catch(e){
			res.end('{"Status":"500 Server error",\n"Detail":"Import error"}');
		}
});

app.all('/api/query/:DelOrGet/:ftype/:dbname/:key',function(req,res){
if (req.method == 'POST'||req.method == 'GET') {
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);
	var action = req.params.DelOrGet;
	if(action=="get"||action=='del'){
		var ftype = req.params.ftype;
		var dbname = req.params.dbname;
		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
		var id = req.param('id');
		var md5 = req.param('md5');
		var t = req.param('t');
		var from = req.param('from');
		var to = req.param('to');
		var id = req.param('id');
		var md5 = req.param('md5');
		var all = req.param('all');
		var dir = req.param('dir');
		var source = req.param('source');
		var url = req.param('url');
		var category = req.param('category');
		var keyword = req.param('keyword');
		var date = req.param('date');
		var title = req.param('title');
		var content = req.param('content');
		var maxoutput = req.param('maxoutput');

		var html = req.param('delhtmltag');
		var lan = req.param('utfCht');

		var parm = {id:id,md5:md5,t:t,from:from,to:to,all:all,dir:dir,source:source,url:url,category:category,keyword:keyword,date:date,title:title,content:content,maxoutput:maxoutput};
		//console.log("Request parameter:"+parm);
		//console.log(parm);
		try{
			search.search(action,dbname,ftype,html,lan,parm,ip,port,function(result){
					res.end(result);
			});
		}
		catch(e){
			res.end('{"Status":"500 Server error",\n"Detail":"Get/Delete error"}');
		}
	}
    else{
			res.end('{"Status":"400 Bad request",\n"Detail":""}');
    }
}
else{
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url+", Status:Refused");
	
	res.end('{"Status":"405 Method Not Allowed",\n"Detail":"Only supports POST and GET"}');
}
});

//db manage
app.get('/api/start',function(request,res){
   	 console.log("["+new Date()+"], Link from ["+request.connection.remoteAddress+"], Method:"+request.method+", URL:"+request.url);
 	fs.readFile('./web/login.html',function(error,data){
		res.end(data);
	});
});
/*
app.get('/api/sign',function(request,res){
 	fs.readFile('./web/sign.html',function(error,data){
		res.end(data);
	});
});
*/
/*
app.get('/api/css/sign',function(request,res){
 	fs.readFile('./web/css/sign.css',function(error,data){
		res.end(data);
	});
});
*/
app.get('/api/css/:style',function(request,res){
	var file = request.params.style;
 	fs.readFile('./web/css/'+file,function(error,data){
		res.end(data);
	});
});
/*
app.get('/test/web/:file',function(request,res){
	var file = request.params.file;
 	fs.readFile('./web/'+file,function(error,data){
		res.end(data);
	});
});
*/
app.all('/api/:key',function(req,res){
if (req.method == 'POST'||req.method == 'GET') {
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);
	if((search.ifNull(req.param('ip'))!=0||search.ifNull(req.param('port'))!=0||search.ifNull(req.param('pas'))!=0)&&search.ifNull(apikeys[req.params.key])!=0){
	//if((search.ifNull(req.param('ip'))!=0||search.ifNull(req.param('port'))!=0||search.ifNull(req.param('pas'))!=0)){
 		fs.readFile('./web/login.html',function(error,data){
			data = S(data).replaceAll("Hello","Please input ip,port and password").s;		
			res.end(data);
		});
	}
	else if(search.ifNull(apikeys[req.params.key])==0){
		
		var key = req.params.key;
		manage.send("DIR",'',"/idb/",apikeys[key].ip,apikeys[key].port,function(stdout){
			if(stdout=='false'){
 				fs.readFile('./web/login.html',function(error,data){
					data = S(data).replaceAll("Hello","Your ip or port doesn\'t exist or you haven\'t start your idb server").s;		
					res.end(data);
				});
				//res.end('{"Status":"403 Forbidden",\n"Detail":"your ip or port doesn\'t exist or you haven\'t start your idb server"}');
			}
			else{
				showpage(key,function(page){
					res.end(page);	
				});
			}
		});
	}
	
	else{
		var test1 = req.param('ip').match(/\b([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\b/);
		var test2 = req.param('port').match(/[^0-9]/);
		if(test1==null||test2!=null){
 			fs.readFile('./web/login.html',function(error,data){
				data = S(data).replaceAll("Hello","Illegal ip or port").s;		
				console.log("illegal:"+req.param('ip')+":"+req.param('port'));
				res.end(data);
			});
		}
		else{
		var id = req.param('ip')+req.param('port');
		getkey.getmd5(id,function(result){
			if(search.ifNull(apikeys[result])!=0){
				manage.send("DIR",'',"/idb/",req.param('ip'),req.param('port'),function(stdout){
					if(stdout=='false'){
 						fs.readFile('./web/login.html',function(error,data){
							data = S(data).replaceAll("Hello","Your ip or port doesn\'t exist or you haven\'t start your idb server").s;		
							res.end(data);
						});
						//res.end('{"Status":"403 Forbidden",\n"Detail":"your ip or port doesn\'t exist or you haven\'t start your idb server"}');
					}
					else{
						var obj={};
						obj.pas=req.param('pas');
						obj.ip=req.param('ip');
						obj.port=req.param('port');
						apikeys[result] = obj;
						fs.writeFileSync('./data/shadow',JSON.stringify(apikeys));
    						apikeys = JSON.parse(fs.readFileSync('./data/shadow'));
						//console.log("Apply success! Your apikey:"+apikeys[result].ip);
						//res.end("Apply success! Your apikey:"+result);
						//console.log("key:"+result);
						var key = result;

						showpage(key,function(page){
							res.end(page);	
						});
					}
				});	
			}
			else{
				manage.send("DIR",'',"/idb/",req.param('ip'),req.param('port'),function(stdout){
					if(stdout=='false'){
 						fs.readFile('./web/login.html',function(error,data){
							data = S(data).replaceAll("Hello","Your ip or port doesn\'t exist or you haven\'t start your idb server").s;		
							res.end(data);
						});
						//res.end('{"Status":"403 Forbidden",\n"Detail":"your ip or port doesn\'t exist or you haven\'t start your idb server"}');
					}
					else{
						if(apikeys[result].pas==req.param('pas')){
							//res.end("Your apikey:"+result);
						//console.log("key:"+result);
						var key = result;

						showpage(key,function(page){
							res.end(page);	
			});
						}
						else{
 							fs.readFile('./web/login.html',function(error,data){
								data = S(data).replaceAll("Hello","Password error").s;		
								res.end(data);
							});
							//res.end("Password error");
						}
					}	
				});
			}




		});
		}
	}
}
else{
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url+", Status:Refused");
	
	res.end('{"Status":"405 Method Not Allowed",\n"Detail":"Only supports POST and GET"}');
}
});

function showpage(key,fin){

			var ip = apikeys[key].ip
			var port = apikeys[key].port
			var method = 'DIR';
			var content = '';
			var dbname ='';
			var path = '/idb/';
	
			try{
		//child_process.exec('/mnt//tool/nginx/bin/fcgiClient -method DIR -U http://'+ip+':'+port+'/idb/',function(err,stdout,stderr){
				manage.send(method,content,path,ip,port,function(stdout){
					 var web='';
					if(stdout=="read db false"){
						res.end('{"Status":"403 Forbidden",\n"Detail":"your ip or port doesn\'t exist or you haven\'t start your idb server"}');
					}
					else{
					 list = stdout.split('\n');
					
					  //stdout = S(stdout).replaceAll('\n','<br/>').s;
 					  fs.readFile('./web/idbweb.php',function(error,data){
						data = S(data).replaceAll("{key}",key).s;		
						web+=data;
						web+="<h3>DB List</h3>";
						for(i=0;i<list.length-1;i++){
							web+="<form id='import"+i+"' name='import"+i+"' method='post' action='/api/query/import/local/"+list[i]+"/"+key+"'>";
							web+="<a href='http://"+apiip+":"+apiport+"/api/query/statusbyi/"+list[i]+"/"+key+"'>"+list[i]+"</a><input type='hidden' name='dbname' value='"+list[i]+"'>"
							+"<input type='text' name='path' value='' placeholder='請輸入檔案名稱'>"
							+"<input type='submit' name='import' id='import' value='Import' /><br/>"
							+""
							+"</form>";
						}
   					  	fin(web);    
   					 });
					}
				});
			}	
			catch(e){
				res.end('{"Status":"500 Server error",\n"Detail":"Get API interface error:'+e+'"}');
		
			}

}
/*
app.post('/api/query/IMPORT',function(req,res){
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);
	try{
        	var path = req.param('path');
        	var dbname = req.param('dbname');
		var data = "/mnt/data/NuDB/WebData/"+path;
		//console.log('./tool/nginx/bin/fcgiClient -M 1 -U http://'+ip+':'+port+'/idb/'+dbname+' -K "@\\n" -R '+data);

		manage.post(data,dbname,ip,port,function(msg){
			res.end(msg);
		});
	}
	catch(e){
		res.end('{"Status":"500 Server error",\n"Detail":"Import error"}');
	}
});
*/


//has error
app.post('/api/query/newbyi/:key',function(req,res){
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);
	
		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
        var dbname = req.param('dbname');
	if(search.ifNull(req.param('index'))==0){
		var content=req.param('index');
		//console.log(content);
		manage.newdb(content,ip,port,dbname,function(result){
			res.end(result);
		});
	}
	else{
		var content = "IndexTag	S:0;TF U:0;mTF C:0;TF K:0;TF t:0;t T:0;TF B:0;HFT D:0;TF id:0;TF md:0;TF";
		manage.newdb(content,ip,port,dbname,function(result){
			res.end(result);
		});

	}
});
app.post('/api/query/new/:key',function(req,res){
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);
	
		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
        var dbname = req.param('dbname');
	var content='';
		try{
			req.on('data', function (data) {
        		        content += data;
        		        if (content.length > 1e6){//prevent too big
        		                req.connection.destroy();
        		        }
        		});
        		req.on('end', function () {
				//console.log("content:"+content);
				manage.newdb(content,ip,port,dbname,function(result){
					res.end(result);
				});
			});
		}
		catch(e){
			res.end('{"Status":"500 Server error",\n"Detail":"New db error"}');
	
		}
});
app.post('/api/query/delete/:key',function(req,res){
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);

		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
        var dbname = req.param('dbname');
        try{
		manage.deldb(ip,port,dbname,function(msg){
			res.end(msg);
		})
	}
	catch(e){
		res.end('{"Status":"500 Server error",\n"Detail":"Delete db error"}');
	}
});
app.all('/api/query/statusbyi/:dbname/:key',function(req,res){
if (req.method == 'POST'||req.method == 'GET') {
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);

		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
	try{
        	var dbname = req.params.dbname;
		manage.detail(ip,port,dbname,function(msg){
			var web='';
			msg = msg.replace(/\\\\n/g,"\\n");		
			msg = msg.replace(/\\n/g,"<br\/>");		
			var obj =  JSON.parse(msg);
			var stat = obj.Status;
			try{
				var num = obj.Detail[0].DataNums;
				var ini = obj.Detail[1].DBini;
				if(search.ifNull(num)!=0||search.ifNull(ini)!=0){
					res.end('{"Status":"404 Not found",\n"Detail":"dbname doesn\'t exist"}');
				}
				else{
 					fs.readFile('./web/status.html',function(error,data){
						data = S(data).replaceAll("{key}",key).s;		
						data = S(data).replaceAll("{dbname}",dbname).s;		
						data = S(data).replaceAll("{status}","Total num:"+num).s;		
						data = S(data).replaceAll("{detail}",ini).s;		
						web+=data;
						res.end(web);
					});
				}
			}
			catch(e){
				res.end('{"Status":"400 Bad request",\n"Detail":""}');
			}

		});
	}
	catch(e){
		res.end('{"Status":"500 Server error",\n"Detail":"Status db error"}');
	}
}
else{
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url+", Status:Refused");
	
	res.end('{"Status":"405 Method Not Allowed",\n"Detail":"Only supports POST and GET"}');
}
});

app.post('/api/query/status/:dbname/:key',function(req,res){
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);

		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
		try{
        		var dbname = req.params.dbname;
			manage.detail(ip,port,dbname,function(msg){
				var obj =  JSON.parse(msg);
				var num = obj.Detail[0].DataNums;
				var ini = obj.Detail[1].DBini;
				if(search.ifNull(num)!=0||search.ifNull(ini)!=0){
					res.end('{"Status":"404 Not found",\n"Detail":"dbname doesn\'t exist"}');
				}		
				res.end(msg);
			});
		}
		catch(e){
			res.end('{"Status":"500 Server error",\n"Detail":"Status db error"}');
		}
});

process.on('SIGINT', function () {
    console.log("[Server stop] ["+new Date()+"] http stop at "+apiip+":"+apiport);
    process.exit(0);
});
process.on('SIGTERM', function () {
    console.log("[Server stop] ["+new Date()+"] http stop at "+apiip+":"+apiport);
    process.exit(0);
});
server.listen(apiport,apiip,function(){
                console.log("[Server start] ["+new Date()+"] http work at "+apiip+":"+apiport);
	});


