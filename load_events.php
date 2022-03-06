<?php
    session_start();
    require 'database.php';
    header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json
    
    if($_SESSION['active_user'] == NULL){
        echo json_encode("guest_user");
    }
    else{
        $user_query = "SELECT COUNT(*) FROM users WHERE username=?";
        $stmt = $mysqli->prepare($user_query);
        $stmt->bind_param('s', $_SESSION['active_user']);
        $stmt->execute();
        $stmt->bind_result($cnt);
        $stmt->fetch();

        //escape output to avoid XSS attacks
        $cnt = htmlentities($cnt);

        if ($cnt == 0){ 
            // guest user detected, no events to display
            echo json_encode("guest_user");
        }
        else{
            // fetch and display events
            // $currUser = "sara";
            $currUser = $_SESSION['active_user'];

            $link = mysqli_connect("localhost", "user1", "access", "calendar");
            if ($link->connect_errno){
                printf("Connection Failed: %s\n", $link->connect_error);
                exit;
            }
            // (user_id, username, event_name, event_date, event_location, event_tag)
            $event_query = mysqli_query($link, "SELECT event_id, `user_id`, username, event_name, event_date, event_location, event_tag FROM events2 WHERE username='$currUser'");
           
            $eventlist = array();
            while ($loadevents = mysqli_fetch_array($event_query)){
                $eventlist[] = $loadevents;
            }
            
            // $stmt->bind_param('s', $currUser);
            //^^^^^ how to bind param without preparing query???
            $stmt->execute();

            echo json_encode($eventlist);
            // echo json_encode("guest_user");
            exit;
        }
    }
?>