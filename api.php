<?php
header("Content-Type:application/json");
require "data.php";

if(!empty($_GET['name']))
{

	$name=$_GET['name'];
	$theme = get_random_theme($random_theme_number);
	
	if(empty($price))
	{
		response(200,"Theme Not Found",NULL);
	}
	else
	{
		response(200,"Theme Found",$theme);
	}
	
}
else
{
	response(400,"Invalid Request",NULL);
}

function response($status,$status_message,$data)
{
	header("HTTP/1.1 ".$status);
	
	$response['status']=$status;
	$response['status_message']=$status_message;
	$response['data']=$data;
	
	$json_response = json_encode($response);
	echo $json_response;
}