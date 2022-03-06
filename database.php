<?php

//define variables
$server = "localhost";
$connection_username = "user1";
$connection_password = "access";
$database = "calendar";

//create connection to database
$mysqli = new mysqli($server, $connection_username, $connection_password, $database);

if ($mysqli->connect_errno){
    printf("Connection Failed: %s\n", $mysqli->connect_error);
    exit;
}

?>