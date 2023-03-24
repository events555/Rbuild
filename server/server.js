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

//TO DO: DELETE THIS AND MAKE IT SO LOGIN SIMPLY SENDS THE ROLE BACK
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

app.get('/getuserid', function (req, res) {
    var wantID = req.query.username;
    connection.query('SELECT userid FROM users WHERE username = ?', [wantID], (err, result) => {
      if (err) {
        throw err;
      }
      // Send data as JSON array of objects
      res.json(result[0]);
    });
});

//reset the auto-incremenet (ADMIN ONLY)
app.patch('/autoincrement', (req, res) => {
    //Verify if user that is logged in is admin
    let username = req.signedCookies.username;
    
        if (!username) {
            // Cookie is tampered or invalid
            res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
            res.send('failure');
            return;
        }
        // Query your database using username
        connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
        if (err) {
            // Database error
            res.send('failure');
            return;
        }
        if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.send('failure');
            return;
        }
        if(username==='admin')
        {
            connection.query('ALTER TABLE users AUTO_INCREMENT = 1', function(error){
                if(error) throw error;
                res.send('success');
            });
        }
    });
});

//Deletes user from database (ADMIN ONLY)
app.delete('/deleteuser/:userid', (req, res) => {
    //Verify if user that is logged in is admin
    let username = req.signedCookies.username;
    
    if (!username) {
        // Cookie is tampered or invalid
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.send('failure');
        return;
        }
    // Query your database using username
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
        if (err) {
            // Database error
            res.send('failure');
            return;
        }
        if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.send('failure');
            return;
        }
        if(username==='admin')
        {
            let userid = req.params.userid;
            connection.query('DELETE FROM users WHERE userid = ?', [userid], function(error){
                if(error) throw error;
                res.send('success');
            });
        }
    });
});

//Updates user's role in database (ADMIN ONLY)
app.patch('/updateuser/:userid', (req, res) => {
    //Verify if user that is logged in is admin
    let username = req.signedCookies.username;
    
    if (!username) {
        // Cookie is tampered or invalid
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.send('failure');
        return;
        }
    // Query your database using username
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
        if (err) {
            // Database error
            res.send('failure');
            return;
        }
        if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.send('failure');
            return;
        }
        if(username==='admin')
        {
            let userid = req.params.userid;
            let newRoleValue = req.body.role;
            connection.query('UPDATE users SET role = ? WHERE userid = ?', [newRoleValue, userid], function(error){
                if(error) throw error;
                res.send('success');
            });
        }
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

//get all the users to display in user management table (ADMIN ONLY)
app.get('/getusers', (req, res) => {
    //Verify if user that is logged in is admin
    let username = req.signedCookies.username;
    
    if (!username) {
        // Cookie is tampered or invalid
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.send('failure');
        return;
        }
    // Query your database using username
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
        if (err) {
            // Database error
            res.send('failure');
            return;
        }
        if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.send('failure');
            return;
        }
        if(username==='admin')
        {
            let sql = 'SELECT * FROM users';
            let query = connection.query(sql, (err, results) => {
                if (err) throw err;
                res.send(results);
            });
        }
    });
});

// Define the /addtrans endpoint
app.post('/addtrans', (req, res) => {
    // Get the parameters from the request body
    const { userid, upc, prod_name, quantity, price } = req.body;

    // check if user exists
    connection.query('SELECT * FROM users WHERE userid = ?', [userid], (err1, userExists) => {
    if (err1) {
      console.error(err1);
      return res.status(500).json({ error: "Internal server error" });
    }
    else if (userExists.length === 0) {
      return res.status(400).json({ error: 'User does not exist' });
    }
    //user exists
    else
    {
        //TO DO: cookie check to make sure correct user is sending the request

        // check if product exists
        const tablesToCheck = ['aio_cooler', 'air_cooler', 'cases', 'gpu', 'memory', 'mobo', 'psu', 'storage'];
        let productExists = false;
        
        let tableIndex = 0;
        
        function checkNextTable() {
            if (productExists || tableIndex >= tablesToCheck.length) {
                // all tables checked
                if (!productExists) {
                return res.status(400).json({ error: 'Product does not exist' });
                }
                
                // insert transaction
                const date = new Date().toISOString().slice(0,10); // Get the current date in YYYY-MM-DD format
                const status = 'On Order'; // Set the status to ordered

                connection.query(
                `INSERT INTO transactions(userid, upc, prod_name, quantity, price, date, status)
                VALUES(?,?,?,?,?,?,?)`,
                [userid, upc, prod_name, quantity, price, date, status],
                (err3) => {
                    if (err3) {
                    console.error(err3);
                    return res.status(500).json({ error: "Internal server error" });
                    }
                    
                    res.json({ message: "Transaction added successfully" });
                }
                );
                
            } else {
                const table = tablesToCheck[tableIndex];
                tableIndex++;
                
                connection.query(`SELECT * FROM ${table} WHERE upc = ?`, [upc], (err2,result) => {
                if (err2) {
                    console.error(err2);
                    return res.status(500).json({ error: "Internal server error" });
                }
                
                if (result.length > 0) {
                    productExists = true;
                }
                
                checkNextTable();
                });
            }
        }
        
        checkNextTable();
    }});
});

//view all orders for specific user
app.get('/view-orders', (req, res) => {
    var userid = req.query.userid;
    // check if user exists
    connection.query('SELECT * FROM users WHERE userid = ?', [userid], (err1, userExists) => {
      if (err1) {
        console.error(err1);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (userExists.length === 0) {
        return res.status(400).json({ error: 'User does not exist' });
      }
  
      else
      {
        //TO DO: cookie check to make sure correct user is sending the request...


        // retrieve transactions
        connection.query(
        `SELECT transid, upc, quantity, price, date, status FROM transactions WHERE userid = ?`,
        [userid],
        (err2, transactions) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ error: "Internal server error" });
          }
          
          res.json(transactions);
        }
      );
      
    }});
});  

//creating a new review
app.post('/create-review', (req, res) => {
    const { userid, upc, rating, comment } = req.body;
    
    // check if product exists
    const tablesToCheck = ['aio_cooler', 'air_cooler', 'cases', 'gpu', 'memory', 'mobo', 'psu', 'storage'];
    let productExists = false;
    
    let tableIndex = 0;
    
    function checkNextTable() {
      if (productExists || tableIndex >= tablesToCheck.length) {
        // all tables checked
        if (!productExists) {
          return res.status(400).json({ error: 'Product does not exist' });
        }
        
        // check if user exists
        connection.query('SELECT * FROM users WHERE userid = ?', [userid], (err1,userExists) => {
          if (err1) {
            console.error(err1);
            return res.status(500).json({ error: "Internal server error" });
          }
          
          if (userExists.length === 0) {
            return res.status(400).json({ error: "User does not exist" });
          }
          
          const username = userExists[0].username;

          //TO DO: cookie check to make sure correct user is sending the request...
          
          // check if review already exists
          connection.query(
            `SELECT * FROM reviews WHERE userid = ? AND upc = ?`,
            [userid, upc],
            (err2,result) => {
              if (err2) {
                console.error(err2);
                return res.status(500).json({ error: "Internal server error" });
              }
              
              if (result.length > 0) {
                return res.status(400).json({ error: "Review already exists" });
              }

              // check if user has actually purchased the item
              connection.query(
                `SELECT * FROM transactions WHERE userid = ? AND upc = ?`,
                [userid, upc],
                (err2,result) => {
                  if (err2) {
                    console.error(err2);
                    return res.status(500).json({ error: "Internal server error" });
                  }
                  
                  if (result.length === 0) {
                    return res.status(400).json({ error: "User has not purchased" });
                  }
                
                    // insert review
                    connection.query(
                    `INSERT INTO reviews(userid, username, upc, rating, comment)
                    VALUES(?,?,?,?,?)`,
                    [userid, username, upc,rating ,comment],
                    (err3) => {
                    if (err3) {
                        console.error(err3);
                        return res.status(500).json({ error: "Internal server error" });
                    }
                    
                    res.json({ message: "Review added successfully" });
                    }
                );
                }
              );
            }
          );
        });
  
      } else {
        const table = tablesToCheck[tableIndex];
        tableIndex++;
        
        connection.query(`SELECT * FROM ${table} WHERE upc = ?`, [upc], (err,result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error" });
          }
          
          if (result.length > 0) {
            productExists = true;
          }
          
          checkNextTable();
        });
      }
    }
  
    checkNextTable();
  });
  
//viewing a review
app.get('/view-reviews', (req, res) => {
    var upc = req.query.upc; 
 
    // check if product exists in reviews table
    connection.query('SELECT * FROM reviews WHERE upc = ?', [upc], (err1,result) => {
      if (err1) {
        console.error(err1);
        return res.status(500).json({ error: "Internal server error" });
      }
      
      if (result.length === 0) {
        return res.status(400).json({ error: 'Product does not exist in reviews' });
      }
      
      // retrieve reviews
      connection.query(
        `SELECT username, upc, rating, comment FROM reviews WHERE upc = ?`,
        [upc],
        (err2,reviews) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ error: "Internal server error" });
          }
          
          res.json(reviews);
        }
      );
      
    });
  
  });  

app.listen(3000);
