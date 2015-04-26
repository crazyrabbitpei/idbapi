<!DOCTYPE html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>IDB test system</title>
    <!-- Bootstrap core CSS -->
    <link href="http://www.cs.ccu.edu.tw/~cp103m/api/css/blog.css?<?php echo date('l jS \of F Y h:i:s A'); ?>" rel="stylesheet">
    <link href="http://www.cs.ccu.edu.tw/~cp103m/api/dist/css/bootstrap.min.css" rel="stylesheet">
  <!--<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>-->
  <script src="https://code.jquery.com/jquery-1.10.2.js"></script>

</head>
 
<body>
<h1>idb測試系統</h1>
<h2>NEW</h2>
<form id="form1" name="form1" method="post" action="/api/query/newbyi/{key}">
  <!--<input type="text" name="ip" id="ip" placeholder="Please Input IP" />
  <input type="text" name="port" id="port" placeholder="Please Input Port" />-->
  <input type="text" name="dbname" id="dbname" placeholder="請輸入dbname" />
  <input type="text" name="index" id="index" placeholder="請輸入IndexTag" />
  <input type="submit" name="submit" id="submit" value="Submit" />
</form>
<h2>DELETE</h2>
<form id="form1" name="form1" method="post" action="/api/query/deletebyi/{key}">
  <!--<input type="text" name="ip" id="ip" placeholder="Please Input IP" />
  <input type="text" name="port" id="port" placeholder="Please Input Port" />-->
  <input type="text" name="dbname" id="dbname" placeholder="請輸入dbname" />
  <input type="submit" name="submit" id="submit" value="Submit" />
</form>
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
</body>
</html>
