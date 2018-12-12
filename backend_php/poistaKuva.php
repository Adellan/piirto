<?php
if(!empty($_REQUEST["id"])){
	$id = $_REQUEST['id'];
	$db = new PDO('sqlite:piirto.sqlite');
    $db->exec("DELETE FROM piirto WHERE id=('$id');");
	$db=null;
}
?> 