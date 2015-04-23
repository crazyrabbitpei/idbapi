var getkey = require('./tool/getkey.js');
var manage = require('./tool/manageidb.js');
var http = require('http');
var express = require("express");
var fs =require('fs');
var bodyParser = require('body-parser');
var urlencode = require('urlencode');
var S = require('string');
var child_process = require('child_process');

var list="";
try {
    service = JSON.parse(fs.readFileSync('./data/service'));
    var apiip = service['keyip'];
    var apiport = service['keyport'];
}
catch (err) {
    console.error(err);
process.exit(9);
}

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
}));

var server = http.createServer(app);

app.post('/api/query/delhtml',function(req,res){
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);
	//console.log(req.headers);
	var content='';
	req.on('data', function (data) {
	        content += data;
        	if (content.length > 1e6){//prevent too big
                	req.connection.destroy();
	        }
        });
	req.on('end', function () {
		try{
			getkey.delhtml(content,function(msg){
				//console.log(msg);
				res.end(msg);
			});
		}
		catch(e){
                        res.end("fail:"+e);
                }
	});
});

app.post('/api/query/getmd5',function(req,res){
   	console.log("["+new Date()+"], Link from ["+req.connection.remoteAddress+"], Method:"+req.method+", URL:"+req.url);
	//console.log(req.headers);
	var content='';
	req.on('data', function (data) {
	        content += data;
        	if (content.length > 1e6){//prevent too big
                	req.connection.destroy();
	        }
        });
	req.on('end', function () {
		try{
			getkey.getmd5(content,function(msg){
				console.log("get md5:"+msg);
				res.end(msg);
			});
			/*
			manage.deletehtml(content,md5db,ip,port,
				function(result){
					res.end("before:"+result);
					//getkey.getmd5(result,function(msg){
						//console.log(content);
						//console.log("get md5:"+msg);
					//	res.end(msg);
					//});
				}
                	);
			*/	
		}
		catch(e){
			res.end("fail:"+e);
		}

	});
	
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


