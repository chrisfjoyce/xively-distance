<?php
   require 'db.php';

   function generate_unique_id(){
      $lft = (time() - 1390960558) * 100;

      $dec = intval(microtime(true)*100) % 100;
      $num = $lft + $dec;
      $last_digs = $num % 100;

      $num = intval($num / 100);
      //$remaining = '1'.$last_dig."$num";
      $remaining = sprintf('1%02d%d',$last_digs,$num);

      $num2 = intval($remaining);

      return base_convert($num2,10,35);
   }
   $unsafe_json = $_POST['json_obskit'];
   $safe_json = mysql_real_escape_string($unsafe_json);

   $unique_code = generate_unique_id();

   $sql = "INSERT INTO permalinks(code,observation_kit_json) VALUES('$unique_code','$safe_json');";

   mysql_query($sql) or die(mysql_error());

   header('Content-type: application/json');
   echo "{\"code\":\"$unique_code\"}";
?>