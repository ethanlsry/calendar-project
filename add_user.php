<?php
    session_start();
    require 'database.php';
    header("Content-Type: application/json");

    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);
    
    //pull desired username and password passed from js file
    $new_username_desired = $json_obj['username_to_add'];
    $new_password_desired_unhashed = $json_obj['password_unhashed'];

    // $passed_token = $json_obj['token'];

    // //validate CSRF token on server side
    // if(!hash_equals($passed_token, $_POST['token'])){
    //     die("Request forgery detected");
    // }

    //salt and hash password
    $new_password_desired = password_hash($new_password_desired_unhashed, PASSWORD_DEFAULT);
    

    if ($new_username_desired != NULL && $new_password_desired != NULL){
        //confirm the username belongs to a registered user
        $user_query = "SELECT COUNT(*), user_id FROM users WHERE username=?";
        $stmt = $mysqli->prepare($user_query);
        $stmt->bind_param('s', $new_username_desired);
        $stmt->execute();
        $stmt->bind_result($cnt, $user_id);
        $stmt->fetch();
        $stmt->close();

        //escape output to avoid XSS attacks
        $cnt = htmlentities($cnt);
        $user_id = htmlentities($user_id);

        if ($cnt != 0){ 
            //username already exists

            echo json_encode(array(
                "status" => "already_exists",
            ));
            exit;
        } else {
            //username does not exist so add it to the database
            $insert_query = "insert into users (username, password) values (?, ?)";
            $stmt_insert = $mysqli->prepare($insert_query);
            $stmt_insert->bind_param('ss', $new_username_desired, $new_password_desired);
            $stmt_insert->execute();
            $stmt_insert->fetch();
            $stmt_insert->close();

            //use HTTP-Only cookies for web security
            ini_set("session.cookie_httponly", 1);

            session_start();
            $_SESSION['active_user'] = $new_username_desired;
            $_SESSION['token'] = bin2hex(random_bytes(32));

            echo json_encode(array(
                "status" => "username_added",
                "token" => $_SESSION['token'],
            ));
            exit;
            
        }
    } else {
        //desired username or desired password is null
        echo json_encode(array(
            "status" => "empty",
        ));
        exit;
    }
?>