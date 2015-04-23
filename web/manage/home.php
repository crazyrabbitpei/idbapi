<!DOCTYPE html>
<html>
  <head>
	<meta content="text/html; charset=utf-8" http-equiv="content-type">
    <title>search for idb</title>

    <!-- Bootstrap core CSS -->
    <link href="./css/blog.css?<?php echo date('l jS \of F Y h:i:s A'); ?>" rel="stylesheet">
    <link href="./dist/css/bootstrap.min.css" rel="stylesheet">
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>

  </head>

  <body>
<script>
function search(title,content,all,dir,source,url,key,delhtmltag,utfCht,category,time,maxoutput,type){
		var state = document.getElementsByClassName('container')[0];
		//state.innerHTML=title+","+content;
		if(type==''){
			type="json";
		}
		if(delhtmltag==''){
			delhtmltag="yes";
		}
		if (window.XMLHttpRequest)
                {// code for IE7+, Firefox, Chrome, Opera, Safari
                                xmlhttp=new XMLHttpRequest();
                }
                else
                {// code for IE6, IE5
                                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                }
                xmlhttp.onreadystatechange = function(){
                                if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
						//state.innerHTML = '';
						state.innerHTML = xmlhttp.responseText;
                                                
						//console.log(xmlhttp.responseText);
						/*
						obj = JSON.parse(xmlhttp.responseText).Detail;
						obj1 = JSON.parse(xmlhttp.responseText).MaxOutput;
						obj2 = JSON.parse(xmlhttp.responseText).Total;
						
						state.innerHTML+="Total:"+obj2+"<br/>";
						state.innerHTML+="MaxOutput:"+obj1+"<br/>";
						if(type=='json'){
							for(i=0;i<obj.length;i++){
								state.innerHTML+="----------------------<br/>"+i+".<br/>"+obj[i].T+"<br/>Category:"+obj[i].C+"<br/>Time:"+obj[i].t+"<br/>Content:"+obj[i].B+"<br/>";
							}
						}
						else if(type=="gais"){
							state.innerHTML+=obj;
						}
						else{
							state.innerHTML = xmlhttp.responseText;
						}
						*/

				}
				else{
					state.innerHTML = 'Loading...';
				}
		}
		//get method
                /*
		xmlhttp.open("GET", "apidata.php?title="+title+"&content="+content+"&all="+all+"&dir="+dir+"&source="+source+"&url="+url+"&key="+key+"&delhtmltag="+delhtmltag+"&utfCht="+utfCht+"&category="+category+"&time="+time+"&maxoutput="+maxoutput+"&type="+type, true);
                xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlhttp.send();
		*/
		//post method
                xmlhttp.open("POST", "getdata.php", true);
                xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xmlhttp.send("title="+title+"&content="+content+"&all="+all+"&dir="+dir+"&source="+source+"&url="+url+"&key="+key+"&delhtmltag="+delhtmltag+"&utfCht="+utfCht+"&category="+category+"&time="+time+"&maxoutput="+maxoutput+"&type="+type);
		
}
</script>



  type:<input type="text" name="type" id="type"/><br/>
  title:<input type="text" name="title" id="title"/><br/>
  content:<input type="text" name="content" id="content"/><br/>
  all:<input type="text" name="all" id="all"/><br/>
  dir:<input type="text" name="dir" id="dir"/><br/>
  source:<input type="text" name="source" id="source"/><br/>
  url:<input type="text" name="url" id="url"/><br/>
  key:<input type="text" name="key" id="key"/><br/>
  delhtmltag:<input type="text" name="delhtmltag" id="delhtmltag"/><br/>
  utfCht:<input type="text" name="utfCht" id="utfCht"/><br/>
  category:<input type="text" name="category" id="category"/><br/>
  date:<input type="text" name="time" id="time"/><br/>
  maxoutput:<input type="text" name="maxoutput" id="maxoutput"/><br/>
<INPUT value="Search" type="button" onclick="search(document.getElementById('title').value,document.getElementById('content').value,document.getElementById('all').value,document.getElementById('dir').value,document.getElementById('source').value,document.getElementById('url').value,document.getElementById('key').value,document.getElementById('delhtmltag').value,document.getElementById('utfCht').value,document.getElementById('category').value,document.getElementById('time').value,document.getElementById('maxoutput').value,document.getElementById('type').value)"/>
    <div class="container"></div>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
  </body>
<script>
//start();
</script>
</html>

