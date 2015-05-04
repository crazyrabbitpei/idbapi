var fs =require('fs');
var getkey = require('./getkey.js');
var search = require('./search.js');
var manage = require('./manageidb.js');
var S = require('string');

function check(req,res,option){
		var test1 = req.body.ip.match(/\b([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\b/);
		var test2 = req.body.port.match(/[^0-9]/);
		if(test1==null||test2!=null){
 			fs.readFile('./web/login.html',function(error,data){
				data = S(data).replaceAll("Hello","Illegal ip or port").s;		
				console.log("illegal:"+req.body.ip+":"+req.body.port);
				res.end(data);
			});
		}
		else{
		    var id = req.body.ip+req.body.port+req.body.pas;
		    getkey.getmd5(id,function(result){
			    if(search.ifNull(apikeys[result])!=0||option=="change"){
				    manage.send("DIR",'',"/idb/",req.body.ip,req.body.port,function(stdout){
					    if(stdout=='false'){
 						    fs.readFile('./web/login.html',function(error,data){
							    data = S(data).replaceAll("Hello","Your ip or port doesn\'t exist or you haven\'t start your idb server").s;		
							    res.end(data);
						    });
					    }
				    	else{
					    	var obj={};
						    obj.pas=req.body.pas;
                            obj.ip=req.body.ip;
                            obj.port=req.body.port;
                            apikeys[result] = obj;
                            fs.writeFileSync('./data/shadow',JSON.stringify(apikeys));
    						    apikeys = JSON.parse(fs.readFileSync('./data/shadow'));
                                //console.log("Apply success! Your apikey:"+apikeys[result].ip);
                                res.redirect('/api/'+result);

                        }
                    });	
                }
                else{
                    manage.send("DIR",'',"/idb/",req.body.ip,req.body.port,function(stdout){
                            if(stdout=='false'){
                            fs.readFile('./web/login.html',function(error,data){
                                data = S(data).replaceAll("Hello","Your ip or port doesn\'t exist or you haven\'t start your idb server").s;		
                                res.end(data);
                            });
                            }
                            else{
                                if(apikeys[result].pas==req.body.pas){
                                    var key = result;
                                    res.redirect('/api/'+result);
                                    }
                                    else{
                                        fs.readFile('./web/login.html',function(error,data){
                                                data = S(data).replaceAll("Hello","Password error").s;		
                                                res.end(data);
                                        });
                                    }
                            }	
                    });
                }
            });
        }
}
function change(fin){

}
exports.check = check;
exports.change = change;

