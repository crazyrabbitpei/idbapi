<?php
$file='../../data/service';
$fp = fopen($file, "r");
while(!feof($fp)){
            $value = fgets($fp);
            $service = json_decode($value,true);
            $ip = $service['ip'];
            $apiport = $service['port'];
	    $keyip = $service['keyip'];
	    $keyport = $service['keyport'];
            break;

}
fclose($file);
//get method
/*
$type=$_GET['type'];
$title="title=".urlencode($_GET['title'])."&";
$content="content=".urlencode($_GET['content'])."&";
$all="all=".urlencode($_GET['all'])."&";
$dir="dir=".urlencode($_GET['dir'])."&";
$source="source=".urlencode($_GET['source'])."&";
$url="url=".urlencode($_GET['url'])."&";
$key="key=".urlencode($_GET['key'])."&";
$category="category=".urlencode($_GET['category'])."&";
$time="time=".$_GET['time']."&";
$maxoutput="maxoutput=".$_GET['maxoutput']."&";
$delhtmltag="delhtmltag=".$_GET['delhtmltag']."&";
$utfCht="utfCht".$_GET['utfCht']."&";
*/
//post method
/*
$type=$_POST['type'];
$title="title=".urlencode($_POST['title'])."&";
$content="content=".urlencode($_POST['content'])."&";
$all="all=".urlencode($_POST['all'])."&";
$dir="dir=".urlencode($_POST['dir'])."&";
$source="source=".urlencode($_POST['source'])."&";
$url="url=".urlencode($_POST['url'])."&";
$key="key=".urlencode($_POST['key'])."&";
$category="category=".urlencode($_POST['category'])."&";
$time="date=".$_POST['time']."&";
$maxoutput="maxoutput=".$_POST['maxoutput']."&";
$delhtmltag="delhtmltag=".$_POST['delhtmltag']."&";
$utfCht="utfCht".$_POST['utfCht']."&";
*/
$data=$_POST['content'];
$action=$_POST['action'];

$db='temp';
/*
//import
$path='ptt/movie/20150303_1705_ptt.rec';
//$request = "http://".$ip.":".$apiport."/api/query/import/".$db."?path=".$path;
//get
$request = "http://".$ip.":".$apiport."/api/query/get/".$type."/".$db."?".$title.$content.$all.$dir.$source.$url.$key.$category.$time.$maxoutput.$delhtmltag.$utfCht;

//echo $request;
*/

// Create a stream
/*
$data = "@\n".
	"@id:9696\n".
	"@B:wow~~".
	"@\n".
	"@id:1234\n".
	"@B:你好嗎測試網站?\n";
*/

switch($action){
    case 'post':
        //for import
        $url = 'http://'.$ip.':'.$apiport.'/api/import/'.$db;
        break;
    case 'getmd5':
        //for get md5
        $url = 'http://'.$keyip.':'.$keyport.'/api/query/getmd5';
        break;
    case 'delhtml':       
        //del html
        $url = 'http://'.$keyip.':'.$keyport.'/api/query/delhtml';
        break;
}

$opts = array(
  'http'=>array(
    'method'=>"POST",
    'header'=>"Content-Type:text/plain",
    'content'=>$data	
  )
);

$context = stream_context_create($opts);

// Open the file using the HTTP headers set above
$res = file_get_contents($url, false, $context);

//$results = json_decode($response, TRUE);
echo "result:".$res//."<br/> url:".$url;
?>
