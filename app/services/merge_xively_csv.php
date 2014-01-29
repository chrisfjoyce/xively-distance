<?php
//$link = mysql_connect('localhost','root','') or die('Could not connect to MySQL: ' . mysql_error());
//$rv = mysql_select_db('xively-iostp', $link) or die('Could not connect to Xively database: ' . mysql_error());

$json_text = $_POST['ta'];
$devicesByDatastream = json_decode($json_text);

header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
header("Cache-Control: public"); // needed for i.e.
header("Content-Type: text/csv");
header("Content-Transfer-Encoding: Binary");
header('Access-Control-Allow-Origin: *');
//header("Content-Length:".filesize($attachment_location));
header("Content-Disposition: attachment; filename=data.csv");


/*
$contents = Array();
array_push($contents,explode("\n", file_get_contents('http://api.xively.com/v2/feeds/491325353/datastreams/Wind_Direction.csv?interval=21600&start=2014-01-01T13:35:07.437Z&end=2014-01-14T13:35:07.437Z&interval_type=discrete&x-apikey=LZ8CcFmj2huPno20yShkEGlm3QQAiuiMYsLQOjHEQpWOSzDs')));
array_push($contents,explode("\n", file_get_contents('http://api.xively.com/v2/feeds/491325353/datastreams/Wind_Direction.csv?interval=21600&start=2014-01-01T13:35:07.437Z&end=2014-01-14T13:35:07.437Z&interval_type=discrete&x-apikey=LZ8CcFmj2huPno20yShkEGlm3QQAiuiMYsLQOjHEQpWOSzDs')));
array_push($contents,explode("\n", file_get_contents('http://api.xively.com/v2/feeds/491325353/datastreams/Wind_Direction.csv?interval=21600&start=2014-01-01T13:35:07.437Z&end=2014-01-14T13:35:07.437Z&interval_type=discrete&x-apikey=LZ8CcFmj2huPno20yShkEGlm3QQAiuiMYsLQOjHEQpWOSzDs')));
*/

//if($devicesByDatastream == null){
   //print_r($_POST);
   //print_r($devicesByDatastream);
//}
foreach ($devicesByDatastream as $datastreamLabel => $datastream) {
   $contents = Array();
   $cols = 0;
   $devices = $datastream->devices;
   $schools = Array();
   //print_r($datastream);
   foreach($devices as $device){
      array_push($contents,explode("\n", file_get_contents(sprintf('http://api.xively.com/v2/feeds/%d/datastreams/%s.csv?interval=21600&start=%s&end=%s&interval_type=discrete&x-apikey=LZ8CcFmj2huPno20yShkEGlm3QQAiuiMYsLQOjHEQpWOSzDs',$device->id,$device->datastreamId,$datastream->start_date,$datastream->end_date))));
      array_push($schools, $device->schoolName);
      $cols++;
   }
   $rows = count($contents[0]);

   echo $datastreamLabel . "\n";
   for($col=0;$col<$cols;$col++){
      echo 'Date' . ',"' . $schools[$col] . '",,';
   }
   echo "\n";
   for($row=0;$row<$rows;$row++){
      for($col=0;$col<$cols;$col++){
         echo $contents[$col][$row] . ',,';
      }
      echo "\n";
   }
   echo "\n";echo "\n";echo "\n";
}
//echo 'Connection OK'; mysql_close($link);
?>