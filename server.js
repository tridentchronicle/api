var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
createPool
  
// default route
app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hello' })
});
// connection configurations
var dbConn = {
    host: 'localhost',
    user: 'root',
    password: 'anticounterfeit',
    database: 'abbyfy'
  };
  
  var connection;
  
  function handleDisconnect() {
    connection = mysql.createConnection(dbConn); // Recreate the connection, since
                                                    // the old one cannot be reused.
  
    connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
  }
  
  handleDisconnect();
// connect to database

 
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
 
// Login
app.post('/login', function (req, res) {
    
    var email = req.body.email;
    var password = req.body.password;
    var category = req.body.category;
    connection.query("SELECT category FROM users where email = ? AND password = ? AND category = ?", [email, password, category], function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

// Profile details
app.post('/profile', function (req, res) {
    
    var email = req.body.email;
    connection.query("SELECT * FROM users where email = ?", email , function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

// all emails
app.post('/emails', function (req, res) {
    
    var email = req.body.email;
    connection.query("SELECT email FROM users ", function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

// View Messages
app.post('/mymessages', function (req, res) {
    
    var email = req.body.email;
    connection.query("SELECT * FROM Messages where user_id_from = ? or user_id_to = ?", [email,email] , function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

// Send Messages
app.post('/sendmessages', function (req, res) {
    
    var from = req.body.from;
    var to = req.body.to;
    var content = req.body.content;
    var date = req.body.date;
    connection.query("INSERT INTO Messages ( message_id, user_id_from, user_id_to, content, date_created ) VALUES  ( null, ? , ? , ? , ? )", [from,to,content,date] , function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});


// Signup
app.post('/signup', function (req, res) {
    
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var address = req.body.address;
    var email = req.body.email;
    var password = req.body.password;
    var category = req.body.category;
    connection.query("INSERT INTO users ( id, first_name, last_name, address, email, password, category ) VALUES  ( null, ? , ? , ? , ? , ? , ?)", [first_name,last_name,address,email,password,category] , function (error, results, fields) {
        return res.send({ error: false, output: results, message: 'success' });
    });
});

 
 
 
// set port
app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});
 
module.exports = app;