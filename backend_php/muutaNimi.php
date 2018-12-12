<?php
if(!empty($_REQUEST["nimi"])){
	$nimi = $_REQUEST['nimi'];
	$id = $_REQUEST['id'];
    $nimi = str_replace("'","''",$nimi);
    $nimi = str_replace("<","",$nimi);
	$db = new PDO('sqlite:piirto.sqlite');
    $db->exec("UPDATE piirto SET nimi=('$nimi') WHERE id=('$id');");
	$db=null;
}
?> 