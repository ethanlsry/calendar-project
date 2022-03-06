<?php
    session_start();
    require 'database.php';
    header("Content-Type: application/json");
    
    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    //use prepared query to pull event info from mysql database
    $event_name_to_edit = $json_obj['edit_event_name'];
    $event_date_to_edit = $json_obj['edit_event_time'];
    $event_new_name = $json_obj['new_event_name'];
    $event_new_date = $json_obj['new_event_time'];
    $event_new_loc = $json_obj['new_event_loc'];
    $event_new_tag = $json_obj['new_event_tag'];

    // $passed_token = $json_obj['token'];

    // //validate CSRF token on server side
    // if(!hash_equals($passed_token, $_POST['token'])){
    //     die("Request forgery detected");
    // }

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
        echo json_encode(array(
            "status" => "not_logged_in",
        ));
        exit;
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

        if ($event_name_to_edit != NULL){
            //is there an event there right now
            //(user_id, username, event_name, event_date, event_location, event_tag)
            $event_query = "SELECT COUNT(*) FROM events2 WHERE (username,event_name,event_date)=(?,?,?)";
            $stmt = $mysqli->prepare($event_query);
            $stmt->bind_param('sss', $_SESSION['active_user'],$event_name_to_edit,$event_date_to_edit);
            $stmt->execute();
            $stmt->bind_result($cnt);
            $stmt->fetch();
            $stmt->close();

            //escape output to avoid XSS attacks
            $cnt = htmlentities($cnt);

            if ($cnt == 0){ 
                //event does not exist
                echo json_encode(array(
                    "status" => "no_event",
                ));
                exit;

                
            } else {
                //grab loc and tag
                $loctag_query = "SELECT event_location, event_tag FROM events2 WHERE (username,event_name,event_date)=(?,?,?)";
                $stmt = $mysqli->prepare($loctag_query);
                $stmt->bind_param('sss', $_SESSION['active_user'],$event_name_to_edit,$event_date_to_edit);
                $stmt->execute();
                $stmt->bind_result($event_saved_loc, $event_saved_tag);
                $stmt->fetch();
                $stmt->close(); 

                //delete old event
                $delete_query = "delete from events2 WHERE (username,event_date)=(?,?)";
                $stmt_delete = $mysqli->prepare($delete_query);
                $stmt_delete->bind_param('ss', $_SESSION['active_user'], $event_date_to_edit);
                $stmt_delete->execute();
                $stmt_delete->fetch();
                $stmt_delete->close();

                //create updated event
                //(user_id, username, event_name, event_date, event_location, event_tag)
                $insert_query = "insert into events2 (user_id, username, event_name, event_date, event_location, event_tag) values (?, ?, ?, ?, ?, ?)";
                $stmt_insert = $mysqli->prepare($insert_query);
                $stmt_insert->bind_param('ssssss', $USER_ID, $_SESSION['active_user'], $event_new_name, $event_new_date, $event_saved_loc, $event_saved_tag);
                $stmt_insert->execute();
                $stmt_insert->fetch();
                $stmt_insert->close();
                echo json_encode(array(
                    "status" => "event_edited",
                ));
                exit;
            }
        } else{
            echo json_encode(array(
                "status" => "empty",
            ));
            exit;
        }
    }
?>