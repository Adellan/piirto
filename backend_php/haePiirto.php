<?php
try{	
	$db = new PDO('sqlite:piirto.sqlite');	
	$sql  = "SELECT * FROM piirto ORDER BY aika DESC";
	$array = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);	
	echo json_encode($array);
}catch(PDOException $e){
	echo("Ei ok!" . $e);
}
$db=null;
?> 