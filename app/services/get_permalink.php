<?php
   require 'db.php';

   $unsafe_code = $_GET['code'];
   $safe_code = mysql_real_escape_string($unsafe_code);
   $sql = "SELECT observation_kit_json from permalinks WHERE code = '$safe_code'";

   //echo $sql;
   $ans = mysql_query($sql) or die(mysql_error());

   $line = mysql_fetch_array($ans);

   header('Content-type: application/json');
   header('Access-Control-Allow-Origin: *');

   if($line == null){
      echo '{"error":"not_found"}';
   }else{
      echo $line[0];
   }
?>