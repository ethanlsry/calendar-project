
//mintified version of calendar library on wiki page (https://classes.engineering.wustl.edu/cse330/index.php?title=JavaScript_Calendar_Library)
(function(){Date.prototype.deltaDays=function(c){return new Date(this.getFullYear(),this.getMonth(),this.getDate()+c)};Date.prototype.getSunday=function(){return this.deltaDays(-1*this.getDay())}})();
function Week(c){this.sunday=c.getSunday();this.nextWeek=function(){return new Week(this.sunday.deltaDays(7))};this.prevWeek=function(){return new Week(this.sunday.deltaDays(-7))};this.contains=function(b){return this.sunday.valueOf()===b.getSunday().valueOf()};this.getDates=function(){for(var b=[],a=0;7>a;a++)b.push(this.sunday.deltaDays(a));return b}}
function Month(c,b){this.year=c;this.month=b;this.nextMonth=function(){return new Month(c+Math.floor((b+1)/12),(b+1)%12)};this.prevMonth=function(){return new Month(c+Math.floor((b-1)/12),(b+11)%12)};this.getDateObject=function(a){return new Date(this.year,this.month,a)};this.getWeeks=function(){var a=this.getDateObject(1),b=this.nextMonth().getDateObject(0),c=[],a=new Week(a);for(c.push(a);!a.contains(b);)a=a.nextWeek(),c.push(a);return c}};

//load DOM content and set up event listener
document.addEventListener("DOMContentLoaded", function(){

    let csrf_token;

    let currentMonth = new Month(2021, 8); // September 2021 (starts at 0)
    console.log("currentMonth.month is intialized to :" + currentMonth.month);
    // testDate();
    const  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var newMonthName = months[currentMonth.month];
    console.log("neMonthName is given:" + newMonthName);
    document.getElementById("currentMonthName").innerHTML = newMonthName;
    document.getElementById("currentYear").innerHTML = currentMonth.year;
    updateCalendar();
    event_month = monthNametoDay(document.getElementById("currentMonthName").innerHTML)+1;
    event_year = document.getElementById("currentYear").innerHTML;
    console.log("EVENT month year after update: " + event_month + "/" + event_year);


    //BACKEND LOGIN FUNCTIONALITY
    function fetchLogin(){
        //get username and password input
        let username_attempt = document.getElementById("username_attempt").value;
        let password_attempt = document.getElementById("password_attempt").value;

        //create object to pass username and passwword attempt to PHP file
        let loginData = { username: username_attempt, password: password_attempt };

        let path_to_php_file = "login.php";
        fetch(path_to_php_file, {
            method: "POST",
            body: JSON.stringify(loginData),
            headers: { 'content-type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => ajaxCallbackUser(data))
        .catch(error => console.error('Error:',error))
    }

    function ajaxCallbackUser(data){
        //ajax callback function to change page and give alerts based on the php file values
        let username_attempt = document.getElementById("username_attempt").value;

        console.log("attempt: " + username_attempt);
        console.log(data.success);

        if (data.success == true){
            alert("you are successfully logged in as " + username_attempt);
            document.getElementById("is_active_user?").innerHTML = ("you are logged in as " + username_attempt);
            //update CSRF token in JS doc
            csrf_token = data.token;
            updateCalendar();
            fetchEvents();
        //} else if (data == "password_invalid"){
        }else if (data.success == false){
            alert("password incorrect. please try again, create a login, or continue as guest.");
            //alert("password incorrect. please try again, create a login, or continue as guest.");
        } else if (data.success == "empty"){
            alert("please type a username and password");
        } else {
            alert("that username does not exist. please try again, create a login, or continue as guest.");
        }
    }

    //BACKEND LOG OUT FUNCTIONALITY
    function fetchLogout(){
        console.log("logout called");
        info = {token: csrf_token};
        let path_to_php_file = "logout.php";
        fetch(path_to_php_file, {
            method: "POST",
            body: JSON.stringify(info),
            headers: { 'content-type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => ajaxCallbackLogOutUser(data))
        .catch(error => console.error('Error:',error))
    }

    function ajaxCallbackLogOutUser(data){
        console.log(data);
        console.log(data.status);
        if (data.status == "logged_out"){
            alert("you have been logged out.");
            document.getElementById("is_active_user?").innerHTML = ("you are logged in as guest");
            updateCalendar();
            fetchEvents();
            deleteEventList();
        } else if (data.status == "no_one_to_logout"){
            alert("you are not logged in as a valid user");
        } else if (data.status == "Request forgery detected"){
            alert("Request forgery detected");
        } else {
            alert("unknown error. please try clearing your brower's cache.");
        }
    }
    

    //ADD USER BACKEND FUNCTIONALITY
    function fetchAddUser(){
        //get username and password input
        let new_username = document.getElementById("newuser").value;
        let new_password_unhashed = document.getElementById("newpassword_unhashed").value;

        //create object to pass username and passwword attempt to PHP file
        let newUserData = { username_to_add: new_username, password_unhashed: new_password_unhashed, token: csrf_token};
        let path_to_php_file = "add_user.php";
        fetch(path_to_php_file, {
            method: "POST",
            body: JSON.stringify(newUserData),
            headers: { 'content-type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => ajaxCallbackAddUser(data))
        .catch(error => console.error('Error:',error))
    }


    function ajaxCallbackAddUser(data){
        let new_username = document.getElementById("newuser").value;

        console.log("new try: " + new_username);

        if (data.status == "username_added"){
            alert(new_username + " was added as a new user" );
            document.getElementById("is_active_user?").innerHTML = ("you are logged in as " + new_username);
            csrf_token = data.token;
            // updateCalendar();
            // fetchEvents();
        } else if (data.status == "already_exists"){
            alert("that username already exist");
        } else if (data.status == "empty"){
            alert("please type a username and password");
        } else if (data.status == "Request forgery detected"){
            alert("Request forgery detected");
        } else {
            alert("unknown error. please try clearing your brower's cache.");
        }
    }

    //CREATE EVENT BACKEND FUNCTIONALITY
    function createEvent(){
        //load in all the data necessary
        //name
        let event_name = document.getElementById("create_event_name").value;
        event_name = event_name.toString();
        //time
        let event_year = document.getElementById("create_event_year").value;
        let event_month = document.getElementById("create_event_month").value;
        let event_day = document.getElementById("create_event_day").value;
        let event_hour = document.getElementById("create_event_hour").value;
        let event_min = document.getElementById("create_event_min").value;
        let event_location = document.getElementById("create_event_location").value;
        let event_tag = document.getElementById("create_event_tag").value;
        
        // proofread via console
        let event_date = event_day + "/" + event_month + "/" + event_year;
        console.log("EVENT NAME: " + event_name);
        console.log("EVENT DATE: " + event_day + "/" + event_month + "/" + event_year);
        console.log("EVENT TIME: " + event_hour +" : " + event_min);
        let time = new Date(event_year, event_month, event_day, event_hour, event_min).getTime();
        
        
        time = time.toString();
        console.log("EVENT SECONDS BEING STORED: " + time);

        //send data off to add_event.php
        let newEventData = { new_event_date_toadd: event_name, new_event_time_toadd: time, new_event_location: event_location, new_event_tag: event_tag, token: csrf_token };
        let path_to_php_file = "add_event.php";
        fetch(path_to_php_file, {
            method: "POST",
            body: JSON.stringify(newEventData),
            headers: { 'content-type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => ajaxCallbackAddEvent(data))
        .catch(error => console.error('Error:',error))
    }

    function ajaxCallbackAddEvent(data){
        let new_event = document.getElementById("create_event_name").value;

        console.log("attempted to add: " + new_event);
        if (data.status == "event_added"){
            alert(new_event + " was added as a new event");
            updateCalendar();
            fetchEvents();
        } 
        else if (data.status == "event_already_exists"){
            alert("An event already exists at that time.");
        } 
        else if (data.status == "not_logged_in"){
            alert("you cannot create an event if you are not logged in");
        } 
        else if (data == "empty"){
            alert("please add an event name");
        } else{
            alert("unknown error. please try clearing your brower's cache.");
        }
    }


    //EDIT EVENT BACKEND FUNCTIONALITY
    function editEvent(){
        //load in all the data necessary
        //name
        let event_name = document.getElementById("edit_event_name").value;
        event_name = event_name.toString();
        //time
        let event_year = document.getElementById("edit_event_year").value;
        let event_month = document.getElementById("edit_event_month").value;
        let event_day = document.getElementById("edit_event_day").value;
        let event_hour = document.getElementById("edit_event_hour").value;
        let event_min = document.getElementById("edit_event_min").value;
        
        // proofread via console
        let event_date = event_day + "/" + event_month + "/" + event_year;
        console.log("EVENT NAME: " + event_name);
        console.log("EVENT DATE: " + event_day + "/" + event_month + "/" + event_year);
        console.log("EVENT TIME: " + event_hour +" : " + event_min);
        let og_time = new Date(event_year, event_month, event_day, event_hour, event_min).getTime();
        og_time = og_time.toString();
        console.log("EVENT SECONDS BEING STORED: " + og_time);

        //create updated_time object for new event time
        //name
        let updated_event_name = document.getElementById("updated_event_name").value;
        updated_event_name = updated_event_name.toString();
        //time
        let updated_event_year = document.getElementById("updated_event_year").value;
        let updated_event_month = document.getElementById("updated_event_month").value;
        let updated_event_day = document.getElementById("updated_event_day").value;
        let updated_event_hour = document.getElementById("updated_event_hour").value;
        let updated_event_min = document.getElementById("updated_event_min").value;
        
        // proofread via console
        let updated_event_date = updated_event_day + "/" + updated_event_month + "/" + updated_event_year;
        console.log("EVENT NAME: " + updated_event_name);
        console.log("EVENT DATE: " + updated_event_day + "/" + updated_event_month + "/" + updated_event_year);
        console.log("EVENT TIME: " + updated_event_hour +" : " + updated_event_min);
        let updated_time = new Date(updated_event_year, updated_event_month, updated_event_day, updated_event_hour, updated_event_min).getTime();
        updated_time = updated_time.toString();
        console.log("UPDATED EVENT SECONDS BEING STORED: " + updated_time);

        //send data off to remove_event.php
        let updatedEventData = { edit_event_name: event_name, edit_event_time: og_time, new_event_name: updated_event_name, new_event_time: updated_time, token: csrf_token};
        let path_to_php_file = "edit_event.php";
        fetch(path_to_php_file, {
            method: "POST",
            body: JSON.stringify(updatedEventData),
            headers: { 'content-type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => ajaxCallbackEditEvent(data))
        .catch(error => console.error('Error:',error))
    }

    function ajaxCallbackEditEvent(data){
        console.log(data);
        let edited_event = document.getElementById("edit_event_name").value;

        console.log("attempted to edit: " + edited_event);
        if (data.status == "event_edited"){
            alert(edited_event + " was modified.");
            updateCalendar();
            fetchEvents();
        } 
        else if (data.status == "wrong_user"){
            alert("You are not authorized to edit this event.");
        } else if (data.status == "no_event"){
            alert("No event exists at this time.")
        }
        else if (data.status == "not_logged_in"){
            alert("you cannot edit an event if you are not logged in");
        } 
        else if (data.status == "empty"){
            alert("please add an event name");
        } else{
            alert("unknown error. please try clearing your brower's cache.");
        }
    }


    //REMOVE EVENT BACKEND FUNCTIONALITY
    function removeEvent(){
        //load in all the data necessary
        //name
        let event_name = document.getElementById("delete_event_name").value;
        event_name = event_name.toString();
        //time
        let event_year = document.getElementById("delete_event_year").value;
        let event_month = document.getElementById("delete_event_month").value;
        let event_day = document.getElementById("delete_event_day").value;
        let event_hour = document.getElementById("delete_event_hour").value;
        let event_min = document.getElementById("delete_event_min").value;
        
        // proofread via console
        let event_date = event_day + "/" + event_month + "/" + event_year;
        console.log("EVENT NAME: " + event_name);
        console.log("EVENT DATE: " + event_day + "/" + event_month + "/" + event_year);
        console.log("EVENT TIME: " + event_hour +" : " + event_min);
        let time = new Date(event_year, event_month, event_day, event_hour, event_min).getTime();
        time = time.toString();
        console.log("EVENT SECONDS BEING STORED: " + time);

        //send data off to remove_event.php
        let removedEventData = { removed_event_name: event_name, removed_event_time: time, token: csrf_token};
        let path_to_php_file = "remove_event.php";
        fetch(path_to_php_file, {
            method: "POST",
            body: JSON.stringify(removedEventData),
            headers: { 'content-type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => ajaxCallbackRemoveEvent(data))
        .catch(error => console.error('Error:',error))
    }

    function ajaxCallbackRemoveEvent(data){
        let removed_event = document.getElementById("delete_event_name").value;

        console.log("attempted to delete: " + removed_event);
        if (data == "event_deleted"){
            alert(removed_event + " was deleted from your calendar");
            updateCalendar();
            fetchEvents();
        } 
        else if (data == "wrong_user"){
            alert("You are not authorized to delete this event.");
        } else if (data == "no_event"){
            alert("No event exists at this time.")
        }
        else if (data == "not_logged_in"){
            alert("you cannot create an event if you are not logged in");
        } 
        else if (data == "empty"){
            alert("please add an event name");
        } else{
            alert("unknown error. please try clearing your brower's cache.");
        }
    }

    //log in event listener
    document.getElementById("log_in_button").addEventListener("click", function(){
        fetchLogin();
    }, false);

    //create user event listener
    document.getElementById("create_user_button").addEventListener("click", function(){
        fetchAddUser();
    }, false);

    //create event event listener
    document.getElementById("create_event_button").addEventListener("click", function(){
        createEvent();
    }, false);

    //edit event event listener
    document.getElementById("updated_event_button").addEventListener("click", function(){
        editEvent();
    }, false);

    //remove event event listener
    document.getElementById("delete_event_button").addEventListener("click", function(){
        removeEvent();
    }, false);    

    //log out event listener
    document.getElementById("log_out_button").addEventListener("click", function(){
        fetchLogout();
    }, false);
    
    //display events event listener
    document.getElementById("display_event_list_button").addEventListener("click", function(){
        fetchEventList();
    }, false);
    
    // Change the month when the "next" button is pressed
    document.getElementById("month_fwd").addEventListener("click", function(event){
        currentMonth = currentMonth.nextMonth();
        console.log("currentMonth.month post change : " + currentMonth.month);
        var monthName=months[currentMonth.month];
        updateCalendar(); // Whenever the month is updated, we'll need to re-render the calendar in HTML
        fetchEvents(); //idkifthisisit
        document.getElementById("currentMonthName").innerHTML = monthName;
        // document.getElementById("currentMonth").innerHTML = currMonth1;
        document.getElementById("currentYear").innerHTML = currentMonth.year;
        //alert("The new month is "+currMonth1+"/"+currentMonth.year);
    }, false);

    // Change the month when the "previous" button is pressed
    document.getElementById("month_back").addEventListener("click", function(event){
        currentMonth = currentMonth.prevMonth(); 
        var monthName=months[currentMonth.month];
        updateCalendar(); // Whenever the month is updated, we'll need to re-render the calendar in HTML
        fetchEvents(); //idkifthisisit
        document.getElementById("currentMonthName").innerHTML = monthName;
        document.getElementById("currentYear").innerHTML = currentMonth.year;
        //alert("The new month is "+currMonth2+"/"+currentMonth.year);
    }, false);


    //clear the calendar, helper to updateCalendar()
    function clearCalendar(){
        for(let w1 = 1; w1<7; w1++){
            for(let d1 = 0; d1<7; d1++){
                //console.log("currday : " + d1);
                var myTable1 = document.getElementById('Calendar');
                ww1 = parseInt(w1);
                dd1 = parseInt(d1);
                myTable1.rows[ww1].cells[dd1].innerHTML = " ";
            }
        }
    }
    
    // This updateCalendar() function only alerts the dates in the currently specified month.  You need to write
    // it to modify the DOM (optionally using jQuery) to display the days and weeks in the current month.
    function updateCalendar(){
        let weeks = currentMonth.getWeeks(); //takes in months that start at 0
                
        //clear the calendar
        clearCalendar();

        //day of week to start at in the month
        var startAt = new Date(currentMonth.year, currentMonth.month, 1).getDay();
        startAt = startAt+1;
        var startedAt = startAt;
        // 6 - Saturday

        //number of days in the month
        numDays = daysinmonth((currentMonth.month+1), currentMonth.year);

        for(let w in weeks){
            let days = weeks[w].getDates();
            
            for(let d in days){
                var myTable = document.getElementById('Calendar');
                wnum = parseInt(w);
                dnum = parseInt(d);
                dayCount = (wnum)*7+(dnum-startedAt+2);

                
                //dont go too long
                if(dayCount > numDays){ 
                    break;
                }

                // fill the calendar
                if(dayCount >= 1){
                    myTable.rows[wnum+1].cells[d].innerHTML = dayCount;
                }
            }
        }
    }
    
    function ajaxCallbackLoadEvents(data){
        if (data == "guest_user"){
            //console.log("there are no events to display for a guest");
        }
        else{
            //console.log("an array of length " + data.length + " was created");
            for(let i = 0; i< data.length; i++){
                let event_id = data[i].event_id;
                let user_id = data[i].user_id;
                let username = data[i].username;
                let event_name = data[i].event_name;
                let event_time = parseInt(data[i].event_date);
                let event_loc = data[i].event_location;
                let event_tag = data[i].event_tag;
                console.log("event name: " + event_name);
                console.log("event loc: " + event_loc);
                console.log("event loc length: " + event_loc.length);
                console.log("event tag: " + event_tag);

                var dateObj = new Date(event_time);
                // console.log("event month: " + dateObj.getMonth());
                // console.log("event year: " + dateObj.getFullYear());
                // console.log("event day: " + dateObj.getDate());
                // console.log("event hour: " + dateObj.getHours());
                console.log("****** loaded event minutes: " + dateObj.getMinutes());
                // console.log("event seconds: " + dateObj.getSeconds());
                // console.log("current month:" + currentMonth.month);
                if(dateObj.getFullYear() != (currentMonth.year)){
                    continue;
                }
                if(dateObj.getMonth() != (currentMonth.month+1)){
                    continue;
                }
                console.log("Month match for event " + event_name);
                let today = new Date().getDate();
                let todayhour = new Date().getHours();
                console.log("THE DAY OF MONTH TODAY IS: "+today);
                console.log("todayhour = " + todayhour);
                console.log("pie day: " + dateObj.getDate());
                console.log("pie hour: " + dateObj.getHours());

                console.log("today: " + today);
                console.log("date of event: " + dateObj.getDate());
                console.log("today + 10: " + (parseInt(today)+10));
                console.log("event: " + event_name + " location: " + event_loc);

                if(todayhour < dateObj.getHours() && today == dateObj.getDate()){
                    alert("Reminder: you have an event today!");
                }
                else if(today < dateObj.getDate() && dateObj.getDate()<= (parseInt(today)+10)){
                    alert("Reminder: you have an event in the next 10 days!");
                }
                let weeks = currentMonth.getWeeks();
    
                // day of week to start at in the month
                var startAt = new Date(currentMonth.year, currentMonth.month, 1).getDay();
                startAt = startAt+1;
                // 6 - Saturday
    
                //number of days in the month
                numDays = daysinmonth((currentMonth.month+1), currentMonth.year);
                for(let w in weeks){
                    let days = weeks[w].getDates();
                    for(let d in days){
                        var myTable = document.getElementById('Calendar');
                        wnum = parseInt(w);
                        dnum = parseInt(d);
                        dayCount = (wnum)*7+(dnum-startAt+2);
                    
    
                        //dont go too long
                        if(dayCount > numDays){ 
                            break;
                        }
    
                        // fill the calendar
                        if((dayCount >= 1) && (dateObj.getDate() ==dayCount)){
                            console.log("Day match for event " + event_name);
                            // console.log("IMPORTANT STUFF PLZ REACH THIS");
                            // console.log("dayCount: " + dayCount);
                            // console.log("startAt: " + startAt);
                            // console.log("reminder: we want 5.");
                            // console.log("dayCount + startAt: " + (dayCount+startAt));
                            // console.log("dayCount + startAt-1: " + (dayCount+startAt-1)); //gives us 5

                            // console.log("hours: " + dateObj.getHours());
                            // console.log("minutes: " + dateObj.getMinutes());

                            if(dateObj.getMinutes() < 10){
                                if (event_loc.length == 0){
                                    event_info = document.createTextNode(dateObj.getHours() + ":" + dateObj.getMinutes()+ "0 " + event_name);
                                    console.log("no location");
                                }
                                else {
                                    event_info = document.createTextNode(dateObj.getHours() + ":0" + dateObj.getMinutes() + " " + event_name + " at " + event_loc);
                                    console.log("location");
                                }
                            }
                            else{
                                if (event_loc.length == 0){
                                    event_info = document.createTextNode(dateObj.getHours() + ":" + dateObj.getMinutes() + " "+ event_name);
                                }
                                else {
                                    event_info = document.createTextNode(dateObj.getHours() + ":" + dateObj.getMinutes() + " "+ event_name + " at " + event_loc);
                                }
                            }

                            console.log("created event_info");
                            let eventblock = document.createElement("fieldset");
                            console.log("created eventblock");
                            eventblock.appendChild(event_info);
                            let string = "tag_"+event_tag;
                            eventblock.className = string;
                            document.getElementById(dayCount+startAt-1).appendChild(eventblock);
                        }
                    }
                }
                //updateCalendar code ends
            }
        }
    }


    function deleteEventList(){
        console.log("deleteEventList entered");
        var check =  document.getElementById('headerblock');
        if(document.body.contains(check)){
            document.getElementById("headerblock").innerHTML = " ";
        }
        document.getElementById("list_events_below").innerHTML = "";
    }

    function ajaxCallbackLoadEventList(data){
        //console.log("made it to ajax");
        if (data == "guest_user"){
            console.log("there are no events to display for a guest");
        }
        else{
            console.log("an array of length " + data.length + " was created");
            var check =  document.getElementById('headerblock');

            //change "display event list" to "hide event list"

            // if (typeof(check) == 'undefined' || check == null){
            if(!document.body.contains(check)){
                
                for(let i = 0; i< data.length; i++){
                    //for each event
                    let event_id = data[i].event_id;
                    let user_id = data[i].user_id;
                    let username = data[i].username;
                    let event_name = data[i].event_name;
                    let event_time = parseInt(data[i].event_date);
                    let event_loc = data[i].event_location;
                    let event_tag = data[i].event_tag;
                    var dateObj = new Date(event_time);
                    console.log("event name: " + event_name);
                    testDay = new Date(dateObj.getFullYear(), dateObj.getMonth()-1, dateObj.getDay());
                    let clarifyDate = testDay.toLocaleString().split(',')[0];
                    if(i==0){
                        header_info = document.createTextNode(username+ "'s events: ");
                        let headerblock = document.createElement("fieldset");
                        headerblock.appendChild(header_info);
                        headerblock.className = "hover_here";
                        headerblock.id = "headerblock";
                        document.getElementById("list_events_below").appendChild(headerblock);

                        //append first event to listeventsbelow, then make classname "e"+event_time;
                        if(dateObj.getMinutes() < 10){
                            if (event_loc.length == 0){
                                event_info = document.createTextNode(clarifyDate + "-- " + dateObj.getHours() + ":" + dateObj.getMinutes()+ "0 " + event_name);
                                console.log("no location");
                            } else {
                                event_info = document.createTextNode(clarifyDate + "-- " + dateObj.getHours() + ":" + dateObj.getMinutes()+ "0 " + event_name + " at " + event_loc);
                                console.log("location");
                            }
                        }
                        else{
                            if (event_loc.length == 0){
                                event_info = document.createTextNode(clarifyDate + "-- " + dateObj.getHours() + ":" + dateObj.getMinutes() + " "+ event_name);
                                console.log("no location");
                            } else {
                                event_info = document.createTextNode(clarifyDate + "-- " + dateObj.getHours() + ":" + dateObj.getMinutes() + " "+ event_name + " at " + event_loc);
                                console.log("location");
                            }
                        }
                        let eventblock = document.createElement("li");
                        let string = "tag_"+event_tag;
                        eventblock.className = string;
                        eventblock.appendChild(event_info);
                        document.getElementById("headerblock").appendChild(eventblock);
                    }
                    else{
                        if(dateObj.getMinutes() < 10){
                            if (event_loc.length == 0){
                                event_info = document.createTextNode(clarifyDate + "-- " + dateObj.getHours() + ":" + dateObj.getMinutes()+ "0 " + event_name);
                                console.log("no location");
                            } else {
                                event_info = document.createTextNode(clarifyDate + "-- " + dateObj.getHours() + ":" + dateObj.getMinutes()+ "0 " + event_name + " at " + event_loc);
                                console.log("location");
                            }
                        }
                        else{
                            if (event_loc.length == 0){
                                event_info = document.createTextNode(clarifyDate + "-- " + dateObj.getHours() + ":" + dateObj.getMinutes() + " "+ event_name);
                                console.log("no location");
                            } else {
                                event_info = document.createTextNode(clarifyDate + "-- " + dateObj.getHours() + ":" + dateObj.getMinutes() + " "+ event_name + " at " + event_loc);
                                console.log("location");
                            }
                        }
                        let eventblock = document.createElement("li");
                        let string = "tag_"+event_tag;
                        eventblock.className = string;
                        eventblock.appendChild(event_info);
                        document.getElementById("headerblock").appendChild(eventblock);
                    }       
                }
            }
        }
    }

    function fetchEvents(){
        console.log("fetchEvents called");
        let path_to_php_file = "load_events.php";
        fetch(path_to_php_file, {
            method: "POST",
        })
        .then(res => res.json())
        .then(data => ajaxCallbackLoadEvents(data))
        .catch(error => console.error('Error:',error))
    }

    function fetchEventList(){
        console.log("fetchEventList called");
        let path_to_php_file = "load_events.php";
        fetch(path_to_php_file, {
            method: "POST",
        })
        .then(res => res.json())
        .then(data => ajaxCallbackLoadEventList(data))
        .catch(error => console.error('Error:',error))
    }


}, false);

function daysinmonth (mnow, ynow) {
    return new Date(ynow, mnow, 0).getDate();
}

function monthNametoDay(name) {
    var res;
    switch (name){
        case "January":
            res = 0;
            break;
        case "February":
            res = 1;
            break;
        case "March":
            res = 2;
            break;
        case "April":
            res = 3;
            break;
        case "May":
            res = 4;
            break;
        case "June":
            res = 5;
            break;
        case "July":
            res = 6;
            break;
        case "August":
            res = 7;
            break;
        case "September":
            res = 8;
            break;
        case "October":
            res = 9;
            break;
        case "November":
            res = 10;
            break;
        case "December":
            res = 11;
            break;
        default:
            console.log(`Error.`);
    }
    return (res);
}