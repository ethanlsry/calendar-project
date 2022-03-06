<?php
    require 'database.php';
    header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json
    
    $json_str = file_get_contents('php://input');
    //This will store the data into an associative array
    $json_obj = json_decode($json_str, true);

    //use prepared query to pull login from mysql database
    $username_attempt = $json_obj['username'];
    $password_attempt = $json_obj['password'];


    if ($username_attempt != NULL && $password_attempt != NULL){
        $user_query = "SELECT COUNT(*), username, password FROM users WHERE username=?";
        $stmt = $mysqli->prepare($user_query);
        $stmt->bind_param('s', $username_attempt);
        // //^^update this so username is actual user attempt
        $stmt->execute();
        $stmt->bind_result($cnt, $username_from_db, $password_from_db);
        $stmt->fetch();

        //escape output to avoid XSS attacks
        $cnt = htmlentities($cnt);
        $username_from_db = htmlentities($username_from_db);
        $password_from_db = htmlentities($password_from_db);

        //encode values in JSON format to pass to JS
        if ($cnt != 0){ 
            if (password_verify($password_attempt,$password_from_db)){
                //use HTTP-Only cookies for web security
                ini_set("session.cookie_httponly", 1);

                //start session and set session variables
                session_start();
                $_SESSION['active_user'] = $username_from_db;
                $_SESSION['token'] = bin2hex(random_bytes(32));

                echo json_encode(array(
                    "success" => true,
                    "token" => $_SESSION['token']
                ));
                exit;


                // echo json_encode("success");
            } else {
                //let js know that password was not valid
                echo json_encode(array(
                    "success" => false
                ));
                exit;
            }

        } else {
            //let js know that the username was not in the database
            // echo json_encode("username_invalid");
            echo json_encode(array(
                "success" => false
            ));
            exit;
        }

        $stmt->close();
    } else {
        echo json_encode("empty");
    }
?>