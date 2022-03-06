<?php
    //logout user by ending sesssion

    session_start();
    require 'database.php';
    header("Content-Type: application/json");
    
    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    // CSRF token authentication
    $passed_token = $json_obj['token'];
    if(!hash_equals($passed_token, $passed_token)){
        if ($_SESSION['active_user'] == NULL){
            echo json_encode(array(
                "status" => "no_one_to_logout",
            ));
            exit;
        } else {
            die(json_encode("Request forgery detected"));
        }
    }
    
    if($_SESSION['active_user'] != NULL){
        $user_query = "SELECT COUNT(*), user_id FROM users WHERE username=?";
        $stmt = $mysqli->prepare($user_query);
        $stmt->bind_param('s', $_SESSION['active_user']);
        $stmt->execute();
        $stmt->bind_result($cnt, $user_id);
        $stmt->fetch();

        //escape output to avoid XSS attacks
        $cnt = htmlentities($cnt);
        $user_id = htmlentities($user_id);

        //encode values in JSON format to pass to JS
        if ($cnt == 0){ 
            session_destroy();

            echo json_encode(array(
                "status" => "no_one_to_logout",
            ));
            exit;
        } else {
            session_destroy();
            echo json_encode(array(
                "status" => "logged_out",
            ));
            exit;
        }

        $stmt->close();

    } else {
        session_destroy();
        echo json_encode(array(
            "status" => "no_one_to_logout",
        ));
        exit;
    }

    exit;
?>