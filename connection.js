// connection.js
let mysql = require('mysql');

let connection = mysql.createConnection({
    host: "localhost",
    user: "wustl_inst",
    password: "wustl_pass"
});

connection.connect(function(err){
    if (err) throw err;
    console.log("now connected");
});