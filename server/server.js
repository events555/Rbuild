const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

//hasing algorithm
const bycrypt = require('bcrypt');
const saltRounds = 10;

//connect this node.js server to the mysql server...
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin',
    database: 'rbuild'
});
connection.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(crypto.randomBytes(64).toString()));
app.use(express.json());
app.use(cors({credentials: true, origin: 'http://localhost'}));

//login cookie check
app.get('/check-cookie', (req, res) => {
    
    let username = req.signedCookies.username;
    
    if (!username) {
    // Cookie is tampered or invalid
    res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
    res.send({ loggedIn: "invalid"});
    return;
    }
    // Query your database using username
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
    if (err) {
        // Database error
        res.send({ loggedIn: "failure" });
        return;
    }
    if (rows.length === 0) {
        // Username does not exist in database
        res.clearCookie('username', {httpOnly: true});
        res.send({ loggedIn: "failure"});
        return;
    }
    //successful login
    var toSend = {
        loggedIn: "success",
        username: username
    };
    var sendResult = JSON.stringify(toSend);
    res.send(sendResult);
    });
});

  

//login post request
app.post('/login', function (req, res) {
    
    // Get the username and password from the request
    const username = req.body.username;
    const password = req.body.password;

    connection.query('SELECT * FROM users WHERE username = ?', [username], function(error, results) {
    
        if(error) throw error;

        if(results.length > 0)
        {
            bycrypt.compare(password, results[0].password, function(err, result){
                if(result==true){
                    //console.log("username: " + username + "; password: " + password + "; login status: success");
                    
                    //create the cookie
                    res.cookie('username', username, {signed: true, httpOnly: true, path: '/'});
                    
                    //send success and username
                    var toSend = {
                        loggedIn: "success",
                        username: username
                    };
                    
                    var sendResult = JSON.stringify(toSend);
                    res.send(sendResult);
                }

                else{
                    //console.log("username: " + username + "; password: " + password + "; login status: failure");
                    res.send({ loggedIn: "failure" });
                }
            });
        }
        else
        {
            console.log("username: " + username + "; password: " + password + "; login status: failure");
            res.send('failure');
        }
    });
});

//register post request
app.post('/register', function (req, res) {
    
    // Get the username and password from the request
    const username = req.body.username;
    const password = req.body.password;

    bycrypt.hash(password, saltRounds, function(err, hash){
        if(err) throw err;

        connection.query('SELECT * FROM users WHERE username = ?', [username], function(error, results) {
        
            if(error) throw error;

            if(results.length > 0)
            {
                //console.log("username: " + username + "; password: " + password + "; register status: failure");
                res.send('failure');
            }

            else
            {
                connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(error){
                    if(error) throw error;
                    //console.log("username: " + username + "; password: " + password + "; register status: success");
                    res.send('success');
                });
            }
        });
    });
});

app.listen(3000);
