var fs =require('fs');
var http = require('http');
var querystring = require('querystring');
var child_process = require('child_process');
var S =require('string');
var dateFormat = require('dateformat');
var urlencode = require('urlencode');

function detail(ip,port,dbname,fin){
		var infor="";
		var data="";
		var content='';
		try{
			console.log("["+new Date()+"] Look up detail:"+dbname);
			send("CMD",content,"/idb/"+dbname+"/?cmd=count",ip,port,function(stdout){
				stdout = S(stdout).replaceAll('\n','').s;
				infor += '{"DataNums":"'+stdout+'"},\n';
			});
			send("STAT",content,"/idb/"+dbname,ip,port,function(stdout){
				//stdout = S(stdout).replaceAll('\n',' ').s;
				stdout = JSON.stringify(stdout);
				infor += '{"DBini":'+stdout+'}\n';
				data = '{"Status":"200 OK",\n"Detail":[\n'+infor+'\n]\n}';
				fin(data);
			});
			//send("CMD",content,"/idb/"+dbname+"/?cmd=MaxOID",ip,port,function(stdout){
				//stdout = S(stdout).replaceAll('\n','').s;
				//infor += '{"NowOid":"'+stdout+'"},\n';
			//});
		}
		catch(e){
				fin('{"Status":"500 Server error",\n"Detail":"Status db error:'+e+'"}');
		}
}
function post(fcgi,data,dbname,ip,port,fin){
	try{
		child_process.exec(fcgi+' -M 1 -U http://'+ip+':'+port+'/idb/'+dbname+' -K "@\\n" -R '+data,function(err,stdout,stderr){
		//console.log(fcgi+' -M 1 -U http://'+ip+':'+port+'/idb/'+dbname+'/ -K "@\\n" -R '+data);
		//send("PUTOBJ",content,"/idb/"+dbname+"/?rechead=@\n",ip,port,function(stdout){
			console.log("["+new Date()+"] Post to:"+dbname+", Status:pulling...");
			if(stderr.indexOf("httpCode=404")==0){
				fin('{"Status":"404 Not found",\n"Detail":"'+dbname+' doesn\'t exist"}');
			}
			if(stdout==''){
				fin('{"Status":"404 Not found",\n"Detail":"Can\'t find file"}');
			}
			else{
				detail(ip,port,dbname,fin);	
			}
		});
	}
	catch(e){
		fin('{"Status":"500 Server error",\n"Detail":"Post error"}');
	}
}
function newdb(content,ip,port,dbname,fin){
	try{
		content=urlencode(S(content).s);
		//send("NEW",content,"/idb/"+dbname,ip,port,function(stdout){
		send("POST",content,"/idb/"+dbname+"/?cmd=newdb&data="+content,ip,port,function(stdout){
			  console.log("["+new Date()+"] Newdb:"+dbname+", Status:"+stdout);
			  if(stdout=='Ok\n'){
				fin('{"Status":"200 OK",\n"Detail":"Success add '+dbname+' to '+ip+':'+port+'"}');
			  	//fin("<h1>Success add "+dbname+" to "+ip+":"+port+"</h1><button onclick=\"window:location.href='http://"+ip+":"+apiport+"/api'\">return</button>");
			  }
			  else{
				fin('{"Status":"400 Bad request",\n"Detail":"'+dbname+' has already existed at '+ip+':'+port+'"}');
			  	//fin("<h1>"+dbname+" is exists at "+ip+":"+port+"</h1><button onclick=\"window:location.href='http://"+ip+":"+apiport+"/api'\">return</button>"+stdout);
			  }
		});
	}
	catch(e){
		fin('{"Status":"500 Server error",\n"Detail":"Newdb error:'+e+'"}');
	}
}
function deldb(ip,port,dbname,fin){
	try{
		send("REMOVEDB",'',"/idb/"+dbname,ip,port,function(stdout){
			  console.log("["+new Date()+"] Deletedb:"+dbname+", Status:"+stdout);

			  if(stdout=='Ok\n'){
				fin('{"Status":"200 OK",\n"Detail":Success delete '+dbname+' from '+ip+':'+port+'}');
			  	//fin("<h1>Success delete "+dbname+" from "+ip+":"+port+"</h1><button onclick=\"window:location.href='http://"+ip+":"+apiport+"/api'\">return</button>");
			  }
			  else{
				fin('{"Status":"400 Bad request",\n"Detail":"Can\'t delete '+dbname+' from '+ip+':'+port+'"}');
			  	//fin("<h1>Can't delete "+dbname+" from "+ip+":"+port+"</h1><button onclick=\"window:location.href='http://"+ip+":"+apiport+"/api'\">return</button>"+stdout);
			  }
		});
	}
	catch(e){
		fin('{"Status":"500 Server error",\n"Detail":"Deletedb error"}');
	}
}
function send(method,content,path,ip,port,fin){
	//var post_data = querystring.stringify(content);
	try{
		var post_data = content;
		//console.log("./fcgiClient -method "+method+" -U "+"'http://"+ip+":"+port+path+"'");
		//console.log("./fcgiClient -method "+method+" -U "+"'http://"+ip+":"+port+"'");
		//new db
		var options = {
       		  host: ip,
	          path: path,
	          port: port,
	          method: method,
		  headers:{}
       		 };
		if(options.method=='POST'|| options.method=='PUTOBJ' || options.method=='NEW'){
			options.headers['Content-Type'] = "text/plain";
			options.headers['Content-Length'] = post_data.length;
		}
		callback = function(response,err) {
                	                var str = ''
                	                response.on('data', function (chunk) {
                	                                                                str += chunk;
                	                                                                });
                	                response.on('end', function () {
							//console.log("str:["+str+"]");
							test = str.match(/<html(.*?)>(.|[\r\n])*?<\/html>/g);
							if(test==null){
                	                                         fin(str);
							}
							else{
								//fin('{"Status":"500 Server error",\n"Detail":"file too large,please use [140.123.4.160:4321/api/query/import/local/dbname/{apikey}?path=some.rec] query to import"}');
                                fin(str);
							}			
                       	         });
                	}

        	var req = http.request(options, callback);
		req.on('error', function(e) {
     			console.log('problem with request: ' + e.message);
			fin("false");
			return;
		});
		if(options.method=='POST'|| options.method=='PUTOBJ' || options.method=='NEW'){
			//console.log(post_data);
 			req.write(post_data,"UTF-8",function(res){
				//console.log("write status:"+res);
			});
		}
		req.end();
	}
	catch(e){
		fin('{"Status":"404 Not found",\n"Detail":"your ip or port doesn\'t exist or you haven\'t start your idb server"}');
	}
	/*import
	request.post({
                url:"http://"+ip+":"+port+"/idb/"+dbname,
                body:content
        },function(error,res,body){
                fin(body);
        });
	*/
}
exports.detail = detail;
exports.send = send;
exports.post = post;
exports.newdb = newdb;
exports.deldb = deldb;
