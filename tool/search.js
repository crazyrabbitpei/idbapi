var http = require('http');
var request = require('request');
var querystring = require('querystring');
var S =require('string');
var urlencode = require('urlencode');
//var iconv = require('iconv-lite');
//var Iconv  = require('iconv').Iconv,
//iconv = new Iconv( "UTF-16", "UTF-8");

var encode = null;
var decode = null;
function search(action,db,type,html,lan,parm,ip,p,fin){
		var range='';
		var time='',date='';
		var query='',page=';pageout:0,3000';
		var from=0,to=3000,total=3000;


		/*------------out put range-------------*/
    		if(ifNull(parm['maxoutput'])==0){
			total = parseInt(parm['maxoutput']);
		}
    		if(ifNull(parm['from'])==0){
			from=parseInt(parm['from']);
		}
		total = from+total;
		to = total;
    		if(ifNull(parm['to'])==0){
			to=parseInt(parm['to']);
			if(to<from){
				to=3000;
			}
		}
		range=';MaxCount:'+total;//cmd method

		if(action=='del'||ifNull(html)==0||ifNull(lan)==0||type=="gais"){
		//if(action=='del'||type=="gais"){
			page='';//because del only need oid not json record,and if you want to use delhtmltag, convert lan or refer output type, must use 'getoid+oid method'
			//console.log("here:"+html+","+lan+","+type);
		}
		else{
			page=';pageout:'+from+','+to;
			//console.log(page+" type:"+type);
		}
		/*---------date range-----------*/
    		if(ifNull(parm['date'])==0){
			time=';date:'+parm['date'];//cmd method
		}
		/*------------------get query parameter-----------------*/
    		if(ifNull(parm['id'])==0){
			parm['id'] = S(parm['id']).replaceAll(","," | ").s;
			query += '(@id:'+parm['id']+') & ';
		}
    		if(ifNull(parm['md5'])==0){
			query += '(@md:'+newformat(parm['md5'])+') & ';
		}
    		if(ifNull(parm['all'])==0){
			query += newformat(parm['all'])+" & ";
		}
        //gais format
        /*
    		if(ifNull(parm['title'])==0){
			//console.log("title:"+newformat(parm['title']));
			query+='(@T:'+newformat(parm['title'])+') & ';
		}
    		if(ifNull(parm['content'])==0){
			query+='(@B:'+newformat(parm['content'])+') & ';
		}
    		if(ifNull(parm['keyword'])==0){
			query+='(@K:'+newformat(parm['keyword'])+') & ';
		}
    		if(ifNull(parm['category'])==0){
			query+='(@C:'+newformat(parm['category'])+') & ';
		}
    		if(ifNull(parm['source'])==0){
			query+='(@S:'+newformat(parm['source'])+') & ';
		}
		
    		if(ifNull(parm['url'])==0){
			query+='(@U:'+newformat(parm['url'])+') & ';
		}
		 
    		if(ifNull(parm['dir'])==0){
			query+='(@D:'+newformat(parm['dir'])+') & ';
		}
        */

        //another format
        
        for(i=0;i<Object.keys(parm).length;i++){
                    key = Object.keys(parm)[i];
                    //if(key!="dir" && key!="source" && key!="url" && key!="category" && key!="keyword" && key!="title" && key!="content" && key!="all"){
                    if(key!="date" && key!="maxoutput" && key!="from" && key!="to" && key!="lan" && key!="html" &&key!="all" &&key!="id" && key!="md"){
    		                if(ifNull(parm[key])==0){
			                    query+='(@'+key+':'+newformat(parm[key])+') & ';
                            }
                    }
        }
        query=urlencode(S(query).left(S(query).length-2).s);

		/*----------------------------------------------*/
		var options = {
		host: ip,
	  	path: '/idb/'+db+'/?cmd=find+query:'+query+range+page+time+";outtype:json;",     //cmd method,需要urlenccode中文,否則會搜尋失敗
	  	//path: '/idb/'+db+'/?q='+query+range,//get method 可直接得到json
	  	port: p,
	  	method: 'CMD',
		encoding: encode,
		decoding: decode
	  	//method: 'GET'
		};	

		console.log("./fcgiClient -method "+options['method']+" -U 'http://"+options['host']+":"+options['port']+options['path'])+"\'";

		//if(page!=''){

		callback = function(response) {
				var str = '';
				response.on('data', function (chunk) {
								str += chunk;
								});

				response.on('end', function () {
							//console.log(str);
							if(str==''){
								fin('{"Status":"404 Not found",\n"Detail":"'+db+' doesn\'t exist"}');
								return;
							}
							else{
								try{
									if(page==''){
										if(str.indexOf("List")<=0){
											str = S(str).left(S(str).length-4).s+"}";
										}
										else{
											str = S(str).replaceAll('-nan,', '0').s;
											str = S(str).left(S(str).length-7).s+"]}";
										}
										var obj =  JSON.parse(str);
										
										var oid ='';
										var start=from,end=to,count=obj.Count;
										if(end>count){
											end=count;
										}
										for(i=start;i<end;i++){
											if(i!=end-1){	
												oid+=S(obj.List[i].I).s+",";
											}
											else{
												oid+=S(obj.List[i].I).s;
											}
										}
										var count = obj.Count;
										var zAll = obj.zAll;
										var time = obj.ExeTime;
										var query = obj.Query;
										if(count==0){
											fin(str);	
										} 
									} 
									if(action=='get'&&page!=''){
										str = S(str).replaceAll(",]}","]}").s;
										str = S(str).replaceAll("\\'","'").s;
										var obj =  JSON.parse(str);
										fin(str);
									}
									else if(action=='get'&&page==''){
										if(to>zAll){to=zAll;}
										//fin(oid);
										getbyoid(from,to,db,oid,count,zAll,time,query,type,html,lan,fin,ip,p);
									}
									else if(action=='del'){
										//fin(oid);
										del(db,oid,fin,ip,p);
									}
								}
								catch(e){
									//fin('{"Status":"500 Server error",\n"List":"json parse error":'+e+'}');
									fin("error:"+e+"\n"+str);
								}
							}
				});
		}
		//}
		/*
		else{	
		callback = function(response) {
				var str = '';
				response.on('data', function (chunk) {
								str += chunk;
								});

				response.on('end', function () {
							//console.log(str);
							if(str==''){
								fin('{"Status":"404 Not found",\n"List":"'+db+' doesn\'t exist"}');
							}
							else{
								//cmd method因為json格式不完整，故要手動編排
								if(str.indexOf("List")<=0){
									str = S(str).left(S(str).length-4).s+"}";
								}
								else{
									str = S(str).replaceAll('-nan,', '0').s;
									str = S(str).left(S(str).length-7).s+"]}";
								}
								try{
									var obj =  JSON.parse(str);
									var count = obj.Count;
									var total = obj.zAll;
									var time = obj.ExeTime;
									var query = obj.Query;
									
									if(action=='get'){						
										getbyoid(db,obj,count,total,time,query,type,html,lan,fin,ip,p);
									}
									else if(action=='del'){
										var oid ='';
										var start=0,end=count;
										/*if(from!=''){
											if(parseInt(from)>start&&parseInt(from)<parseInt(count)){
												//console.log("from:"+from+"<="+"count:"+count);
												start = parseInt(from)-1;
											}
										}
										if(to!=''){
											if(parseInt(to)<parseInt(count)&&parseInt(to)>start){
												end = parseInt(to);
											}
										}*/
		/*
										for(i=start;i<end;i++){
											if(i!=end){	
												oid+=S(obj.List[i].I).s+",";
											}
											else{
												oid+=S(obj.List[i].I).s;
											}
										}
										if(count==0){fin("false");}
										//del(db,oid,fin,ip,p);
									}
								}
								catch(e){
									fin('{"Status":"500 Server error",\n"List":"json parse error":'+e+'}');
								}
							}
				});
		}
		}
		*/
		var req = http.request(options, callback);
		req.on('error',function(e){
			console.log('problem with request: ' + e.message);
			fin('{"Status":"403 Forbidden",\n"Detail":"your ip or port doesn\'t exist or you haven\'t start your idb server"}');
		});
		req.end();
}

function ifNull(parm){
		if(typeof parm!=="undefined" && parm!=''){
			return 0;
		}
		else{
			return 1;
		}
}
exports.search = search;
exports.ifNull = ifNull;

function newformat(parm){
	parm = S(parm).replaceAll(","," & ").s;
	parm = S(parm).replaceAll("|"," | ").s;
	//parm = S(parm).replaceAll("'"," ").s;
	return parm;
}
function checkGaisFormat(key,fin){
    console.log("checkGaisFormat");
    if(key!="dir" && key!="source" && key!="url" && key!="category" && key!="keyword" && key!="title" && key!="content" && key!="all"){
        //fin("not gais");
    }
    else{
        //fin("gais");
    }
}
function del(db,oid,fin,ip,p) {
		console.log("del:"+oid);
		var options = {
			host: ip,
	  		path: '/idb/'+db+'/?cmd=delobject+oid:'+oid,//cmd method,可以指定多個
	  		port: p,
	  		method: 'CMD',
			encoding: encode,
			decoding: decode
		};
		//console.log("./fcgiClient -method "+options['method']+" -U 'http://"+options['host']+":"+options['port']+options['path'])+"\'";
		callback = function(response) {
				var str = ''
						response.on('data', function (chunk) {
										str += chunk;
										});
				response.on('end', function () {
								str = '{"Status":"200 OK",\n"Detail":"delete success"}';
								fin(str);
								});
		}
		var req = http.request(options, callback);
		req.on('error',function(e){
			console.log('problem with request: ' + e.message);
			fin('{"Status":"403 Forbidden",\n"Detail":"your ip or port doesn\'t exist or you haven\'t start your idb server"}');
		});
		req.end();
}

function getbyoid(from,to,db,oid,count,zAll,time,query,type,html,lan,fin,ip,p){
	  /*	
	   if(from!=''){
		if(parseInt(from)>start&&parseInt(from)<parseInt(count)){
			//console.log("from:"+from+"<="+"count:"+count);
			start = parseInt(from)-1;
		}
	   }
	   if(to!=''){
		if(parseInt(to)<parseInt(count)&&parseInt(to)>start){
			end = parseInt(to);
		}
	   }
	   */
	   //console.log("total:"+total+"\ncount:"+count+"\nfrom:"+from+"\nto:"+to+"\nstart:"+start+"\nend:"+end);
	   /*
	   for(i=start;i<end;i++){
		   if(i!=end){	
		  	 oid+=S(obj.List[i].I).s+",";
		   }
		   else{
		  	 oid+=S(obj.List[i].I).s;
		   }
	   }
		*/
	//console.log("oid:"+oid);

		var format = ";outtype:json";//cmd method
		if(type=="gais"){
			format = "";
		}
		if(html=="yes"){
			format+=";delhtmltag:1"//cmd method
		}
		if(lan=="yes"){
			format+=";utfCht:1"//cmd method
		}
		var options = {
		host: ip,
	  path: '/idb/'+db+'/?cmd=getobject+oid:'+oid+format,//cmd method,可以指定多個
	  port: p,
	  method: 'CMD',
	  encoding: encode,
          decoding: decode
		};
		console.log("./fcgiClient -method "+options['method']+" -U 'http://"+options['host']+":"+options['port']+options['path'])+"\'";
		//console.log("format:"+format);
		callback = function(response) {
				var str = ''
						response.on('data', function (chunk) {
											str += chunk;
										});

				response.on('end', function () {
							//console.log(str);
							/*if(str=''){
								str = '{"Status":"400 Bad request",\n"Detail":""}';
								fin(str);
							}*/
								if(type=="gais"){
									str = JSON.stringify(str);
									//query = JSON.stringify(query);

									str = '{"Query":"'+query+'",\n"Count":'+count+',\n"ExeTime":'+time+',\n"from":'+from+',\n"to":'+to+',\n"zAll":'+zAll+',\n"Detail":'+str+'}';
									//str = '{"MaxOutput":'+count+',\n"ExeTime":'+time+',\n"Results":'+str+'}';
								}
								else{
									
									str = S(str).replaceAll("{\"List\" :","").s;
									str = S(str).replaceAll('}\n]}','},').s;
									str = '{"Query":"'+query+'",\n"Count":'+count+',\n"ExeTime":'+time+',\n"from":'+from+',\n"to":'+to+',\n"zAll":'+zAll+',\n"Detail":'+str+'}';
									str = S(str).replaceAll('},\n}','}]}').s;
								}
								
								try{
									obj = JSON.parse(str);
									
								}catch(e){
									str = JSON.stringify(str);
									fail = '{"Status":"500 Server error",\n"Detail":"json parse error:'+e+':"'+str+'}';
									fin(fail);

									return ;
								}

								
								var pre='';
								//for(i=0;i<obj.Detail.length;i++){
								//for(i=0;i<1;i++){

									//pre += obj.Detail;
								//}
								
								fin(str);
								});
		}
		var req = http.request(options, callback);

		req.on('error',function(e){
			console.log('problem with request: ' + e.message);
			fin('{"Status":"403 Forbidden",\n"Detail":"your ip or port doesn\'t exist or you haven\'t start your idb server"}');
		});
		req.end();
}

function TEST(record) {
		// Build the post string from an object
		//var post_data = querystring.stringify({
		//				'gaisRec:':record
		//				});

		var options = {
		host: '',
	  //path: '/idb/apitest/?cmd=find+query:(@T:(好雷+格雷))',//cmd method
	  //path: '/idb/'+db+'/?q=(@T:(好雷+格雷));',//get method 可直接得到json
	  //path: '/idb/'+db+'/?cmd=count;',//只有cmd method 可count,MaxOID
	  //path: '/idb/'+db+'/' ,//post methd,PUTOBJ method還沒試
	  //path: '/idb/'+db+'/?cmd=delobject+oid:1',//cmd method,可以指定多個
	  //path: '/idb/'+db+'/1232',//delobj method,只能一次刪一個
	  //path: '/idb/'+db+'/', //new or remove method,創立新資料庫
	  port: '',
	  //method: 'CMD'
	  //method: 'NEW',//不能有req.write();會false，要重開nginx
	  //method: 'REMOVEDB',
	  //method: 'POST',
	  //method: 'PUTOBJ',//無法用page index
	  //method: 'DELOBJ'//無法用DELETE method
	  //method: 'GET'
	  /*headers: {
					  'Content-Type': 'application/x-www-form-urlencoded'
					  //'Content-Length': post_data.length
			  }*/

		};
		callback = function(response) {
				var str = ''
						response.on('data', function (chunk) {
										str += chunk;
										});

				response.on('end', function () {
								//console.log(str);
								});
		}
		var req = http.request(options, callback);
		// post the data
		//req.write(post_data);
		//req.write("hi!");
		req.end();
}

