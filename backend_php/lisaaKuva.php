<?php
if(!empty($_REQUEST["kuva"])){
	$nimi = $_REQUEST['nimi'];
	$kuva = $_REQUEST['kuva'];
    $aika = $_REQUEST['aika'];
    $nimi = str_replace("'","''",$nimi);
    $nimi = str_replace("<","",$nimi);
	$db = new PDO('sqlite:piirto.sqlite');
	$db->exec("INSERT INTO piirto(nimi, kuva, aika) VALUES('$nimi','$kuva','$aika');");	
	$db=null;
}
?> 