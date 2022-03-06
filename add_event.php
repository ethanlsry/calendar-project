<?php
    session_start();
    require 'database.php';
    header("Content-Type: application/json");
    
    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    //use prepared query to pull event info from mysql database
    $new_event_name = $json_obj['new_event_date_toadd'];
    $new_event_date = $json_obj['new_event_time_toadd'];
    $new_event_location = $json_obj['new_event_location'];
    $new_event_tag = $json_obj['new_event_tag'];

    $passed_token = $json_obj['token'];

    //validate CSRF token on server side
    if(!hash_equals($passed_token, $_POST['token'])){
        die("Request forgery detected");
    }


    //confirm the username belongs to a registered user
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
        //check user credentials by confirming user_id exists in database- 
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

        //search for user_id that matches
        while($stmt->fetch()){
            $USER_ID = htmlspecialchars($ID_check);
            break;
        }
        $stmt->close();

        if ($new_event_name != NULL){

            //check to see if there's event at the given time (the way our code is set up, the start time of an event is a unique identifier)
        //    ***
        //     $event_query = "SELECT COUNT(*) FROM events WHERE event_date=?";
        //     $stmt = $mysqli->prepare($event_query);
        //     $stmt->bind_param('s', $new_event_date);
        //     $stmt->execute();
        //     $stmt->bind_result($cnt);
        //     $stmt->fetch();
        //     $stmt->close();
        //     ****


            $event_query = "SELECT COUNT(*) FROM events2 WHERE event_date=?";
            $stmt = $mysqli->prepare($event_query);
            $stmt->bind_param('s', $new_event_date);
            $stmt->execute();
            $stmt->bind_result($cnt);
            $stmt->fetch();
            $stmt->close();

            //escape output to avoid XSS attacks
            $cnt = htmlentities($cnt);

            if ($cnt != 0){ 
                //already event at given time
                echo json_encode(array(
                    "status" => "event_already_exists",
                ));
                exit;

                
            } else {
                //add new event to database

                // ***
                // // $insert_query = "insert into events (user_id, username, event_name, event_date) values (?, ?, ?, ?)";
                // // $stmt_insert = $mysqli->prepare($insert_query);
                // // $stmt_insert->bind_param('ssss', $USER_ID, $_SESSION['active_user'], $new_event_name, $new_event_date);
                // // $stmt_insert->execute();
                // // $stmt_insert->fetch();
                // // $stmt_insert->close();
                // // echo json_encode("event_added");
                // ****

                $insert_query = "insert into events2 (user_id, username, event_name, event_date, event_location, event_tag) values (?, ?, ?, ?, ?, ?)";
                $stmt_insert = $mysqli->prepare($insert_query);
                $stmt_insert->bind_param('ssssss', $USER_ID, $_SESSION['active_user'], $new_event_name, $new_event_date, $new_event_location, $new_event_tag);
                $stmt_insert->execute();
                $stmt_insert->fetch();
                $stmt_insert->close();

                echo json_encode(array(
                    "status" => "event_added",
                ));
                exit;
            }
        } else{
            //new event name is null
            echo json_encode(array(
                "status" => "empty",
            ));
            exit;
        }
    }
?>