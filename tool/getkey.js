var request = require('request');
var md5 = require('MD5');
var S = require('string');
var fs = require('fs');
var cheerio = require('cheerio');
var regexp = require('node-regexp')
try {
    service = JSON.parse(fs.readFileSync('./data/rule'));
    var rule1 = service['rule1'];
    var rule2 = service['rule2'];
}
catch (err) {
    console.error(err);
}
function getmd5(content,fin){
	try{
		content = rule1+content+rule2;
		delhtml(content,function(result){
			var key  = md5(result);
			fin(key);
		});

	}
	catch(e){
		console.log(e);
	}
}
function delhtml(content,fin){
	try{
		test = content.match(/(<body(.*?)>(.|[\r\n])*?<\/body>)/g);
		if(test!=null){
			$ = cheerio.load(content);
			content = $.html('body');
			test = content.match(/(<script(.*?)>(.|[\r\n])*?<\/script>)|(<style(.*?)>(.|[\r\n])*?<\/style>)/g);
			if(test!=null){
				for(i=0;i<test.length;i++){
					content = S(content).strip(test[i]).s;
				}
			}
			content = S(content).stripTags().s;
			fin(content);
		}
		else{
			test = content.match(/(<script(.*?)>(.|[\r\n])*?<\/script>)|(<style(.*?)>(.|[\r\n])*?<\/style>)/g);
			if(test!=null){
				for(i=0;i<test.length;i++){
					content = S(content).strip(test[i]).s;
				}
			}
			content = S(content).stripTags().s;
			fin(content);
		}
		//console.log("result:"+content);

	}
	catch(e){
		console.log(e);
	}

}
exports.getmd5 = getmd5;
exports.delhtml = delhtml;
