<?php

    session_start();
    require 'database.php';
    header("Content-Type: application/json");
    
    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    //use prepared query to pull event info from mysql database
    $event_name_to_remove = $json_obj['removed_event_name'];
    $event_date_to_remove = $json_obj['removed_event_time'];
 
    // CSRF token authentication
    $passed_token = $json_obj['token'];
    if(!hash_equals($passed_token, $passed_token)){
        die(json_encode("Request forgery detected"));
    }

    //does the person have a username
    $user_query = "SELECT COUNT(*) FROM users WHERE username=?";
    $stmt = $mysqli->prepare($user_query);
    $stmt->bind_param('s', $_SESSION['active_user']);
    $stmt->execute();
    $stmt->bind_result($cnt);
    $stmt->fetch();
    $stmt->close();

    //escape output to avoid XSS attacks
    $cnt = htmlentities($cnt);

    if ($cnt == 0){ 
        echo json_encode("not_logged_in");
    }
    else{

        //snag user ID
        $ID_query = "SELECT user_id from users where username=?";
        $stmt = $mysqli->prepare($ID_query);
        if(!$stmt){
            printf("Query Prep Failed: %s\n", $mysqli->error);
            exit;
        }
        $stmt->bind_param('s', $_SESSION['active_user']);
        $stmt->execute();
        $stmt->bind_result($ID_check);

        //escape output to avoid XSS attacks
        $ID_check = htmlentities($ID_check);

        //LOOK FOR THE ID THAT MATCHES
        while($stmt->fetch()){
            $USER_ID = htmlspecialchars($ID_check);
            break;
        }
        $stmt->close();

        if ($event_name_to_remove != NULL){

            //is there an event there right now
            $event_query = "SELECT COUNT(*) FROM events2 WHERE (username,event_date)=(?,?)";
            $stmt = $mysqli->prepare($event_query);
            $stmt->bind_param('ss', $_SESSION['active_user'],$event_date_to_remove);
            $stmt->execute();
            $stmt->bind_result($cnt);
            $stmt->fetch();
            $stmt->close();

            //escape output to avoid XSS attacks
            $cnt = htmlentities($cnt);

            if ($cnt == 0){ 
                //event does not exist
                echo json_encode("no_event");
            } else {


                //delete event
                $delete_query = "delete from events2 WHERE (username,event_date)=(?,?)";
                $stmt_delete = $mysqli->prepare($delete_query);
                //$stmt_delete->bind_param('ssss', $USER_ID, $_SESSION['active_user'], $new_event_name, $new_event_date);
                $stmt_delete->bind_param('ss', $_SESSION['active_user'], $event_date_to_remove);
                $stmt_delete->execute();
                $stmt_delete->fetch();
                $stmt_delete->close();
                echo json_encode("event_deleted");
            }
        } else{
            echo json_encode("empty");
        }
    }
?>