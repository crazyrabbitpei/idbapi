<!DOCTYPE html>
<html>
  <head>
	<meta content="text/html; charset=utf-8" http-equiv="content-type">
    <title>post test</title>

    <!-- Bootstrap core CSS -->
    <link href="http://www.cs.ccu.edu.tw/~cp103m/api/css/blog.css?<?php echo date('l jS \of F Y h:i:s A'); ?>" rel="stylesheet">
    <link href="http://www.cs.ccu.edu.tw/~cp103m/api/dist/css/bootstrap.min.css" rel="stylesheet">
  <!--<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>-->
  <script src="https://code.jquery.com/jquery-1.10.2.js"></script>


  </head>
 <body>
 <textarea  id="content" placeholder='content'></textarea><br/>
<!--

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
-->
<button id='post'>post data</button>
<button id='getmd5'>getmd5</button>
<button id='delhtml'>deletehtml</button>
<!--<INPUT id='button' value="Search" type="button" onclick="search(document.getElementById('title').value,document.getElementById('content').value,document.getElementById('all').value,document.getElementById('dir').value,document.getElementById('source').value,document.getElementById('url').value,document.getElementById('key').value,document.getElementById('delhtmltag').value,document.getElementById('utfCht').value,document.getElementById('category').value,document.getElementById('time').value,document.getElementById('maxoutput').value,document.getElementById('type').value)"/>-->
    <div class="container"></div>

  </body>
 <script>
/*
$.ajax("apidata.php",{
    'data': {"data":"hihi"}, 
    'type': 'POST',
    'contentType': 'text/plain' ,
    'success':function(data){console.log(JSON.stringify(data))}
});
*/

$("#post").click(function(){
console.log("click");
  var str = $( "#content" ).val();
  $.post("postdata.php",{content:str,action:"post"},function(data,status){
    var div = document.getElementsByClassName('container')[0];
    div.innerHTML = data;
    console.log("Data: " + data + "\nStatus: " + status);
  });
});
$("#getmd5").click(function(){
console.log("click");
  var str = $( "#content" ).val();
  $.post("postdata.php",{content:str,action:"getmd5"},function(data,status){
    var div = document.getElementsByClassName('container')[0];
    div.innerHTML = data;
    console.log("Data: " + data + "\nStatus: " + status);
  });
});
$("#delhtml").click(function(){
console.log("click");
  var str = $( "#content" ).val();
  $.post("postdata.php",{content:str,action:"delhtml"},function(data,status){
    var div = document.getElementsByClassName('container')[0];
    div.innerHTML = data;
    console.log("Data: " + data + "\nStatus: " + status);
  });
});

</script>

</html>

