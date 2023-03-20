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

//login cookie check
app.get('/admin-check-cookie', (req, res) => {
    
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
    if(username==='admin')
    res.send({ loggedIn: "success"});
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
            //console.log("username: " + username + "; password: " + password + "; login status: failure");
            res.send({ loggedIn: "failure" });
        }
    });
});

//login post request
app.post('/admin-login', function (req, res) {
    
    // Get the username and password from the request
    const username = req.body.username;
    const password = req.body.password;

    connection.query('SELECT * FROM users WHERE username = ?', [username], function(error, results) {
    
        if(error) throw error;

        if(results.length > 0 && username==='admin')
        {
            bycrypt.compare(password, results[0].password, function(err, result){
                if(result==true){
                    //console.log("username: " + username + "; password: " + password + "; login status: success");
                    
                    //create the cookie
                    res.cookie('username', username, {signed: true, httpOnly: true, path: '/'});
                    
                    //send success and username
                    res.send({ loggedIn: "success" });
                }

                else{
                    //console.log("username: " + username + "; password: " + password + "; login status: failure");
                    res.send({ loggedIn: "failure" });
                }
            });
        }
        else
        {
            //console.log("username: " + username + "; password: " + password + "; login status: failure");
            res.send({ loggedIn: "failure" });
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
                //no role specified
                if(!req.body.role)
                {
                    connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(error){
                        if(error) throw error;
                        //console.log("username: " + username + "; password: " + password + "; register status: success");
                        res.send('success');
                    });
                }

                //role specified
                else
                {
                    connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, req.body.role], function(error){
                        if(error) throw error;
                        //console.log("username: " + username + "; password: " + password + "; register status: success");
                        res.send('success');
                    });
                }
            }
        });
    });
});

//reset the auto-incremenet
app.patch('/autoincrement', (req, res) => {
    //TO DO: verify if user that is logged in is admin (check if admin cookie exists)



    connection.query('ALTER TABLE users AUTO_INCREMENT = 1', function(error){
        if(error) throw error;
        res.send('success');
    });
});

// DELETE endpoint to delete user from database
app.delete('/deleteuser/:userid', (req, res) => {
    //TO DO: verify if user that is logged in is admin (check if admin cookie exists)



    let userid = req.params.userid;
    connection.query('DELETE FROM users WHERE userid=' +userid, function(error){
        if(error) throw error;
        res.send('success');
    });
});

// PATCH endpoint to update user's role in database
app.patch('/updateuser/:userid', (req, res) => {
    //TO DO: verify if user that is logged in is admin



    let userid = req.params.userid;
    let newRoleValue = req.body.role;
    connection.query('UPDATE users SET role = ? WHERE userid = ?', [newRoleValue, userid], function(error){
        if(error) throw error;
        res.send('success');
    });
});


//retrieve part that the client wants and forward the data
app.get('/product', (req, res) => {
    var partTable = req.query.part;
    // Query data from MySQL table
    let sql = 'SELECT * FROM ' + partTable;
    connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      // Send data as JSON array of objects
      res.json(result);
    });
  });

//get all the users to display in user management table
app.get('/getusers', (req, res) => {
    let sql = 'SELECT * FROM users';
    let query = connection.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.listen(3000);
