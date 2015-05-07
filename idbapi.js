
//TODO : seperate all functions to routes file
var config = require('./tool/config.js');
var user = require('./tool/user.js');
var manage = require('./tool/manageidb.js');
var search = require('./tool/search.js');
var getkey = require('./tool/getkey.js');

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
var local,fcgi,apiip,apiport;
var apikeys = {};
var options={
  root:__dirname+"/web/",
  dotfiles:'deny',
  header:{
      'x-timestamp': Date.now(),
      'x-sent': true
  }
};
//reade service data
config.config(function(datapath,fcgipath,ip,port,apikey){
    local = datapath;
    fcgi = fcgipath;
    apiip = ip;
    apiport = port;
    apikeys = apikey;
});
//middleware
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname+'/web/'));
app.use(express.static(__dirname+'/web/css/'));
app.use(function(req,res,next){
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);
    next();
});

app.use("/api/*",function(req,res,next){
    /*
    var key = req.params[0];
    console.log("ori:"+key);
    if(key=="idb"){
    }
    else{
        key = key.match(/(\{)[\w]+(\})/g);
        key = S(key).replace("{","").s;
        key = S(key).replace("}","").s;
        console.log("grab:"+key);
        
        if(search.ifNull(apikeys[key])!=0){
            res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
        }
        else{
            var ip=apikeys[key].ip;
            var port=apikeys[key].port;
            req.apikey = key;
            console.log("ip:"+ip,",port:"+port+",apikey:"+req.apikey);
        }
    }
    */
    next();
});

var server = http.createServer(app);
app.post('/check',function(req,res){
        user.check(req,res,"ckeck");

});
app.get('/api/:key',function(req,res){
	//if((search.ifNull(req.body.ip)!=0||search.ifNull(req.body.port)!=0||search.ifNull(req.body.pas)!=0)&&search.ifNull(apikeys[req.params.key])!=0){
	if(search.ifNull(apikeys[req.params.key])!=0){
 		fs.readFile('./web/login.html',function(error,data){
			data = S(data).replaceAll("Hello","Apikey wrong").s;		
			res.end(data);
		});
	}
	else if(search.ifNull(apikeys[req.params.key])==0){
		var key = req.params.key;
		manage.send("DIR",'',"/idb/",apikeys[key].ip,apikeys[key].port,function(stdout){
			if(stdout=='false'){
 				fs.readFile('./web/login.html',function(error,data){
					data = S(data).replaceAll("Hello","You haven\'t start your idb server").s;
					res.end(data);
				});
			}
			else{
				showpage(key,function(page){
					res.end(page);	
				});
			}
		});
	}
});
//idb query
//use path name to import
app.post('/api/query/import/local/:dbname/:key',function(req,res){
		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
        try{
        	var path = req.body.path;
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
});

//import for one or more, and data can out of local
app.post('/api/query/import/:dbname/:key',function(req,res){

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

app.all('/api/query/:DelOrGet(del|get)/:ftype(gais|json)?/:dbname/:key',function(req,res){
    if(req.params.DelOrGet&&(req.method == 'GET'||req.method =="POST")){
	    var action = req.params.DelOrGet;
        var ftype;
        if(req.params.ftype){
		    ftype = req.params.ftype;
        }
        else{
            ftype = "json";
        }
        //path paramaters
		var dbname = req.params.dbname;
		var key = req.params.key;

		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
        //option
		var id = req.query.id;
		var md5 = req.query.md5;
		var date = req.query.date;
		var maxoutput = req.query.maxoutput;
		var from = req.query.from;
		var to = req.query.to;
        //static
		var all = req.query.all;
		var html = req.query.delhtmltag;
		var lan = req.query.utfCht;


		var parm = {id:id,md5:md5,from:from,to:to,date:date,maxoutput:maxoutput};
        for(i=0;i<Object.keys(req.query).length;i++){
            key = Object.keys(req.query)[i];
            value = req.query[key];
            parm[key]=value;
        }

		//var parm = {id:id,md5:md5,from:from,to:to,all:all,dir:dir,source:source,url:url,category:category,keyword:keyword,date:date,title:title,content:content,maxoutput:maxoutput};
		//console.log("parm:"+JSON.stringify(parm));
        //console.log("total key:"+Object.keys(parm));
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
app.post('/api/query/newbyi/:key',function(req,res){
		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
        var dbname = req.body.dbname;
	if(search.ifNull(req.body.index)==0){
		var content=req.body.index;
		//console.log(content);
		manage.newdb(content,ip,port,dbname,function(result){
			res.end(result);
		});
	}
	else{
		//var content = "IndexTag	S:0;TF U:0;mTF C:0;TF K:0;TF t:0;t T:0;TF B:0;HFT D:0;TF id:0;TF md:0;TF";
        var content="";
		manage.newdb(content,ip,port,dbname,function(result){
			res.end(result);
		});

	}
});
app.post('/api/query/new/:dbname/:key',function(req,res){
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
app.post('/api/query/deletebyi/:key',function(req,res){
		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
        var dbname = req.body.dbname;
        try{
		manage.deldb(ip,port,dbname,function(msg){
			res.end(msg);
		})
	}
	catch(e){
		res.end('{"Status":"500 Server error",\n"Detail":"Delete db error"}');
	}
});
app.delete('/api/query/delete/:dbname/:key',function(req,res){
		var key = req.params.key;
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	        }
	        else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
        var dbname = req.params.dbname;
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
		var key = req.params.key;
        /*
		if(search.ifNull(apikeys[key])!=0){
        	        res.end('{"Status":"401 Unauthorized",\n"Detail":"invalid API key"}');
	    }
	    else{
	        	var ip=apikeys[key].ip;
		        var port=apikeys[key].port;
		}
        */
	    var ip=apikeys[key].ip;
		var port=apikeys[key].port;
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
	res.end('{"Status":"405 Method Not Allowed",\n"Detail":"Only supports POST and GET"}');
}
});

app.post('/api/query/status/:dbname/:key',function(req,res){

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
app.all('*',function(req,res){
    //res.redirect('/login.html');
    res.status(404).send('{"Status":"404 Not found",\n"Detail":"Query error"}');
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


