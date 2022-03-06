<?php


// session_start();
// require 'database.php';
// header("Content-Type: application/json");


// //confirm the username belongs to a registered user
// $user_query = "SELECT COUNT(*), event_name, event_location FROM events2 WHERE username=?";
// $stmt = $mysqli->prepare($user_query);
// $stmt->bind_param('s', $_SESSION['active_user']);
// $stmt->execute();
// $stmt->bind_result($cnt, $upcoming_name, $upcoming_location);
// $stmt->fetch();
// $stmt->close();

// //escape output to avoid XSS attacks
// $cnt = htmlentities($cnt);
// $upcoming_name = htmlentities($upcoming_name);
// $upcoming_location = htmlentities($upcoming_location);

// if ($cnt == 0){ 
//     // echo json_encode("Welcome, " + $_SESSION['active_user'] + ", you have no events coming up.");
//     echo json_encode(array(
// 		"busy" => "false",
//         "name" => "rick",
// 	));
// }
// else{
//     echo json_encode(array(
// 		"busy" => "true",
//         "name" => "joe",
//         "next_event" => "tennassee",
// 	));
//}
?>