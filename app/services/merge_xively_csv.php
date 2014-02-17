<?php

$INTERVAL_VALUES = array(
  0 => array(
    'index' => 0,
    'interval' => 0,
    'maximum' => 6
  ),
  1 => array(
    'index' => 1,
    'interval' => 30,
    'maximum' => 12
  ),
  2 => array(
    'index' => 2,
    'interval' => 60,
    'maximum' => 24
  ),
  3 => array(
    'index' => 3,
    'interval' => 300,
    'maximum' => 120
  ),
  4 => array(
    'index' => 4,
    'interval' => 900,
    'maximum' => 336
  ),
  5 => array(
    'index' => 5,
    'interval' => 1800,
    'maximum' => 744
  ),
  6 => array(
    'index' => 6,
    'interval' => 3600,
    'maximum' => 744
  ),
  7 => array(
    'index' => 7,
    'interval' => 10800,
    'maximum' => 2160
  ),
  8 => array(
    'index' => 8,
    'interval' => 21600,
    'maximum' => 4320
  ),
  9 => array(
    'index' => 9,
    'interval' => 43200,
    'maximum' => 8640
  ),
  10 => array(
    'index' => 10,
    'interval' => 86400,
    'maximum' => 8640
  )
);
$INTERVAL_CURRENT_INDEX = 8;


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
      // array_push($contents,explode("\n", file_get_contents(sprintf('http://api.xively.com/v2/feeds/%d/datastreams/%s.csv?interval=21600&start=%s&end=%s&interval_type=discrete&x-apikey=LZ8CcFmj2huPno20yShkEGlm3QQAiuiMYsLQOjHEQpWOSzDs',$device->id,$device->datastreamId,$datastream->start_date,$datastream->end_date))));
      $timeToAdd = $INTERVAL_VALUES[$INTERVAL_CURRENT_INDEX]['maximum'];
      $endDate = new DateTime($datastream->end_date);
      $newStartDate = new DateTime($datastream->start_date);
      $newEndDate = clone $newStartDate;
      $newEndDate->modify("+".$timeToAdd." hours");
      $contentsTmp = array();
      while ($newStartDate < $endDate) {
         $newStartDateISO = $newStartDate->format("c");
         $newEndDateISO = $newEndDate->format("c");
         $data = explode("\n", file_get_contents(sprintf('http://api.xively.com/v2/feeds/%d/datastreams/%s.csv?interval=%s&start=%s&end=%s&x-apikey=LZ8CcFmj2huPno20yShkEGlm3QQAiuiMYsLQOjHEQpWOSzDs',$device->id,$device->datastreamId,$INTERVAL_VALUES[$INTERVAL_CURRENT_INDEX]['interval'],$newStartDateISO,$newEndDateISO)));
         for ($i = 0; $i < count($data); $i++) {
            if ($data[$i] != "") {
               array_push($contentsTmp, $data[$i]);
            }
         }
         $newStartDate->modify("+".$timeToAdd." hours");
         $newEndDate->modify("+".$timeToAdd." hours");
         if ($newEndDate > $endDate) {
           $newEndDate = clone $endDate;
         }
      }
      array_push($schools, $device->schoolName);
      array_push($contents, $contentsTmp);
      $cols++;
   }

   $rows = 0;
   for ($i = 0; $i < count($contents); $i++) {
      if ($rows < count($contents[$i]))
      $rows = count($contents[$i]);
   }

   echo $datastreamLabel . "\n";
   for($col=0;$col<$cols;$col++){
      echo 'Date' . ',"' . $schools[$col] . '",,';
   }
   echo "\n";
   for($row=0;$row<$rows;$row++){
      for($col=0;$col<$cols;$col++){
         if ($contents[$col][$row] == '') {
            echo ',,,';
         } else {
            echo $contents[$col][$row] . ',,';
         }
      }
      echo "\n";
   }
   echo "\n";echo "\n";echo "\n";
}
//echo 'Connection OK'; mysql_close($link);
?>