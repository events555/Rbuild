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
    host: 'localhost',
    user: 'root',
    password: '20112001',
    database: 'rbuild'
});
connection.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser(crypto.randomBytes(64).toString()));
app.use(express.json());
app.use(cors({credentials: true, origin: 'http://localhost'}));
app.use(cors({
  origin: '*'
}));

//login cookie check
app.get('/check-cookie', (req, res) => {
    
    let username = req.signedCookies.username;
    
    if (!username) {
    // Cookie is tampered or invalid
    res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
    res.status(401).send({ loggedIn: "invalid"});
    return;
    }
    // Query your database using username
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
    if (err) {
        // Database error
        res.status(500).send({ loggedIn: "failure" });
        return;
    }
    if (rows.length === 0) {
        // Username does not exist in database
        res.clearCookie('username', {httpOnly: true});
        res.status(401).send({ loggedIn: "failure"});
        return;
    }

    //successful login
    connection.query('UPDATE users SET online = ? WHERE username = ?', [1, username], function(error){
      if(error) throw error;
    });

    var toSend = {
        loggedIn: "success",
        username: username
    };
    var sendResult = JSON.stringify(toSend);
    res.status(200).send(sendResult);
    });
});

//login cookie check
app.get('/admin-check-cookie', (req, res) => {
    let username = req.signedCookies.username;
    
    if (!username) {
    // Cookie is tampered or invalid
    res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
    res.status(401).send({ loggedIn: "invalid"});
    return;
    }
    // Query your database using username
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
    if (err) {
        // Database error
        res.status(500).send({ loggedIn: "failure" });
        return;
    }
    if (rows.length === 0) {
        // Username does not exist in database
        res.clearCookie('username', {httpOnly: true});
        res.status(401).send({ loggedIn: "failure"});
        return;
    }
    if(username==='admin')
    {
      connection.query('UPDATE users SET online = ? WHERE username = ?', [1, username], function(error){
        if(error) throw error;
        res.status(200).send({ loggedIn: "success"});
      });
    }
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
                    //create the cookie and send the username
                    res.cookie('username', username, {signed: true, httpOnly: true, path: '/'});

                    connection.query('UPDATE users SET online = ? WHERE username = ?', [1, username], function(error){
                      if(error) throw error;
                      delete results[0]['password']
                      res.status(200).send(results[0]);
                    });
                }

                else
                    res.status(400).send('Incorrect login');
            });
        }
        else
        {
            res.status(400).send('User was not found');
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
                    //set status to online
                    connection.query('UPDATE users SET online = ? WHERE username = ?', [1, username], function(error){
                      if(error) throw error;
                      res.status(200).send({ loggedIn: "success" });
                    });
                }

                else{
                    //console.log("username: " + username + "; password: " + password + "; login status: failure");
                    res.status(400).send({ loggedIn: "failure" });
                }
            });
        }
        else
        {
            //console.log("username: " + username + "; password: " + password + "; login status: failure");
            res.status(403).send({ loggedIn: "failure" });
        }
    });
});

//register post request
app.post('/reply-review', function (req, res) {
    
  // Get the username and password from the request
  
  const {review_id, content, user_id} = req.body;
  
  connection.query('UPDATE reviews SET reply = ?, reply_user_id = ? WHERE reviewid = ?', [content, user_id, review_id], function(error){
    if(error) throw error;
    
    res.status(200).send("OK!");
  });

});

app.post('/delete-review', function (req, res) {
    
  // Get the username and password from the request
  
  const {reason, user_id, review_id} = req.body;
  
  connection.query('UPDATE reviews SET isDeleted = 1, deleteReason = ?, delete_by = ? WHERE reviewid = ?', [reason, user_id, review_id], function(error){
    if(error) throw error;
    
    res.status(200).send("OK!");
  });

});

//register post request
app.post('/register', function (req, res) {
    
    // Get the username and password from the request
    const username = req.body.username;
    const password = req.body.password;

    if(username && password)
    {
      var passwordRegex =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      var isValid = passwordRegex.test(password);

      connection.query('SELECT * FROM users WHERE username = ?', [username], function(error, results) {
            
        if(error) throw error;

        else if(results.length > 0)
            res.status(400).send('Account already exists');

        else
        {
          if(isValid)
          {
            bycrypt.hash(password, saltRounds, function(err, hash){
            if(err) throw err;
            
            //no role specified
            if(!req.body.role)
            {
                connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(error){
                    if(error) throw error;
                    res.status(201).send('New user created with default role Customer');
                });
            }

            //role specified
            else
            {
                connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, req.body.role], function(error){
                    if(error) throw error;
                    res.status(201).send('New user created with role ' + req.body.role);
                });
            }
          });
          }

        else
          res.status(400).send('Password must...<br>- Be at least 8 characters<br>- Contain 1 lower & uppercase leter<br>- Contain 1 digit & 1 symbol');
        }
    });
    }

    else
      res.status(400).send('Incomplete Submission');
});

app.post('/logout', function (req, res) {
  //Verify if user that is logged in is anyone but customer
  let cookieUsername = req.signedCookies.username;
  let userid = req.query.userid;
  
  if (!cookieUsername) {
      // Cookie is tampered or invalid
      res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
      res.status(400).send('Cookie was tampered wiith or invalid');
      return;
      }

  // Query your database using username
  connection.query('SELECT * FROM users WHERE username = ?', [cookieUsername], (err, rows) => {
      if (err) {
          // Database error
          res.status(500).send('Internal server error');
          return;
      }
      if (rows.length === 0) {
          // Username does not exist in database
          res.clearCookie('username', {httpOnly: true});
          res.status(400).send('User does not exist');
          return;
      }
  });

  //get the username for the userid
  connection.query('SELECT username FROM users WHERE userid = ?', [userid], (err, wantUsername) => {
    if (err)
      throw err;

      //successful logout: delete user cookie and then set status online to 0
      connection.query('UPDATE users SET online = ? WHERE username = ?', [0, wantUsername[0].username], function(error){
        if(error) throw error;
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.status(200).send('User has successfully logged out');
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
      res.status(200).json(result[0]);
    });
});

// Reset the auto-incremenet (ADMIN ONLY)
app.patch('/autoincrement', (req, res) => {
    //Verify if user that is logged in is admin
    let username = req.signedCookies.username;
    
        if (!username) {
            // Cookie is tampered or invalid
            res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
            res.status(200).send('Cookie tampered with or invalid');
            return;
        }
        // Query your database using username
        connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
        if (err) {
            // Database error
            res.status(400).send('Internal server error');
            return;
        }
        else if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.status(400).send('User does not exist');
            return;
        }
        else if(username!=='admin')
          res.status(403).send('failure');
            
          connection.query('ALTER TABLE users AUTO_INCREMENT = 1', function(error){
            if(error) throw error;
            res.status(200).send('success');
        });
    });
});

app.post('/update-product', function (req, res) {
  var {upc, category, stock, price} = req.body;
  console.log(upc);
  console.log(category);
  console.log(price);
  connection.query(` UPDATE ${category} SET stock = ?, price = ?  WHERE upc = ?`, [stock, price, upc], (err, result) => {
    if (err) {
      throw err;
    }
    // Send data as JSON array of objects
    res.status(200).json(result[0]);
  });
});

// Deletes user from database (ADMIN ONLY)
app.delete('/deleteuser/:userid', (req, res) => {
    //Verify if user that is logged in is admin
    let username = req.signedCookies.username;
    
    if (!username) {
        // Cookie is tampered or invalid
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.status(400).send('Cookie tampered with or invalid');
        return;
        }
    // Query your database using username
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
        if (err) {
            // Database error
            res.status(500).send('Internal server error');
            return;
        }
        else if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.status(400).send('User does not exist');
            return;
        }
        else if(username!=='admin')
          res.status(403).send('failure');
      });
            
      let userid = req.params.userid;
      connection.query('DELETE FROM users WHERE userid = ?', [userid], function(error){
          if(error) throw error;
          res.status(200).send('success');
    });
});

// Updates user's role in database (ADMIN ONLY)
app.patch('/updateuser/:userid', (req, res) => {
    //Verify if user that is logged in is admin
    let username = req.signedCookies.username;
    
    if (!username) {
        // Cookie is tampered or invalid
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.status(400).send('Cookie tampered with or invalid');
        return;
        }
    // Query your database using username
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
        if (err) {
            // Database error
            res.status(500).send('Internal server error');
            return;
        }
        if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.status(403).send('User does not exist');
            return;
        }
        if(username!=='admin')
        {
          res.status(403).send('failure');
        }
    });

    let userid = req.params.userid;
    let newRoleValue = req.body.role;
    connection.query('UPDATE users SET role = ? WHERE userid = ?', [newRoleValue, userid], function(error){
        if(error) throw error;
        res.status(200).send('success');
    });
});

// Retrieve part that the client wants and forward the data
app.get('/product', (req, res) => {
  var partTable = req.query.part;
  var limit = 10;
  limit = req.query.limit;
  if(limit == undefined) limit = 10;
  var page = 0;
  page = req.query.page;
  if(page == undefined) page = 0;
  //query all databases
  if (partTable === 'all') {
    const tables = ['aio_cooler', 'air_cooler', 'cpu', 'cases', 'gpu', 'memory', 'mobo', 'psu', 'storage'];
    let result = {};
    let count = 0;
    tables.forEach(table => {
      connection.query(`SELECT * FROM ${table} limit ${limit} offset ${page}`, (error, rows) => {
        if (error) throw error;
        result[table] = rows.map(row => ({...row, table}));
        count++;
        if (count === tables.length) {
          res.status(200).json(result);
        }
      });
    });
  }

  //query a single database
  else
  {
    let sql = 'SELECT * FROM ' + partTable;
    connection.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    // Send data as JSON array of objects
    res.status(200).json(result);
  });
  }
});

// Retrieve part that the client wants and forward the data
app.get('/product-detail', (req, res) => {
  var partTable = req.query.category;
  var upc = req.query.upc;
  if(upc == null || partTable == null) return res.status(404).json("INvalid Request!");
  
  response = {};
    let sql = 'SELECT * FROM ' + partTable + " where upc = '" + upc + "'";
  connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      // Send data as JSON array of objects
      response['product'] = result;
      console.log(response);
  });

  connection.query(`SELECT * FROM reviews where upc = ${upc}`, (err, result) => {
    if (err) {
      throw err;
    }
    // Send data as JSON array of objects
    response['reviews'] = result;
    res.status(200).json(response);
  });

}
);

// Retrieve part that the client wants and forward the data
app.get('/product', (req, res) => {
    var partTable = req.query.part;
    var limit = 10;
    limit = req.query.limit;
    if(limit == undefined) limit = 10;
    var page = 0;
    page = req.query.page;
    if(page == undefined) page = 0;
    //query all databases
    if (partTable === 'all') {
      const tables = ['aio_cooler', 'air_cooler', 'cpu', 'cases', 'gpu', 'memory', 'mobo', 'psu', 'storage'];
      let result = {};
      let count = 0;
      tables.forEach(table => {
        connection.query(`SELECT * FROM ${table} limit ${limit} offset ${page}`, (error, rows) => {
          if (error) throw error;
          result[table] = rows.map(row => ({...row, table}));
          count++;
          if (count === tables.length) {
            res.status(200).json(result);
          }
        });
      });
    }
  
    //query a single database
    else
    {
      let sql = 'SELECT * FROM ' + partTable;
      connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      // Send data as JSON array of objects
      res.status(200).json(result);
    });
    }
});

// Retrieve part that the client wants and forward the data
app.get('/search-product', (req, res) => {
  var partTable = req.query.category;
  var keyword = req.query.keyword;
  var memory = req.query.memory;
  var storage = req.query.storage;
  var cpu = req.query.cpu;
  var fromPrice = req.query.fromPrice;
  var toPrice = req.query.toPrice;


  var limit = 10;
  limit = req.query.limit;
  if(limit == undefined) limit = 10;
  var page = 0;
  page = req.query.page;
  if(page == undefined) page = 0;


  if(memory !== null && memory !== undefined){
    limit = 10;
    let sql = `SELECT * FROM memory where mem_type = '${memory}'`;
    if(keyword !== null && keyword !== undefined){
      sql += ` AND prod_name like '%${keyword}%'`;
    }
    if(fromPrice !== null && fromPrice !== undefined){
      sql += ` AND cast(substr(price, 2) as UNSIGNED) between ${fromPrice} and ${toPrice}`;
    }
    sql += ` limit ${limit} offset ${page}`;
    connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      let response = {};
      response['memory'] = result;
      // Send data as JSON array of objects
      res.status(200).json(response);
    })
    return;
  }

  if(storage !== null && storage !== undefined){
    limit = 10;
    let sql = `SELECT * FROM storage where capacity = '${storage}'`;
    if(keyword !== null && keyword !== undefined){
      sql += ` AND prod_name like '%${keyword}%'`;
    }
    if(fromPrice !== null && fromPrice !== undefined){
      sql += ` AND cast(substr(price, 2) as UNSIGNED) between ${fromPrice} and ${toPrice}`;
    }
    sql += ` limit ${limit} offset ${page}`;
    connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      let response = {};
      response['storage'] = result;
      // Send data as JSON array of objects
      res.status(200).json(response);
    })
    return;
  }

  if(cpu !== null && cpu !== undefined){
    limit = 10;
    let sql = `SELECT * FROM cpu where prod_name like '%${cpu}%'`;
    if(keyword !== null && keyword !== undefined){
      sql += ` AND prod_name like '%${keyword}%'`;
    }
    if(fromPrice !== null && fromPrice !== undefined){
      sql += ` AND cast(substr(price, 2) as UNSIGNED) between ${fromPrice} and ${toPrice}`;
    }
    sql += ` limit ${limit} offset ${page}`;
    connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      let response = {};
      response['cpu'] = result;
      // Send data as JSON array of objects
      res.status(200).json(response);
    })
    return;
  }


  if(keyword === null || keyword === undefined){
    keyword = " ";
  }
  //query all databases
  if (partTable === 'all' || partTable === null || partTable === undefined) {
    const tables = ['aio_cooler', 'air_cooler', 'cpu', 'cases', 'gpu', 'memory', 'mobo', 'psu', 'storage'];
    let result = {};
    let count = 0;
    tables.forEach(table => {
      var sql = `SELECT * FROM ${table} where prod_name like '%${keyword}%' limit ${limit} offset ${page}`;

      connection.query(sql, (error, rows) => {
        if (error) throw error;
        result[table] = rows.map(row => ({...row, table}));
        count++;
        if (count === tables.length) {
          res.status(200).json(result);
        }
      });
    });
  }

  //query a single database
  else
  {
    let sql = 'SELECT * FROM ' + partTable + ' where 1 = 1 ';
    if(keyword !== null && keyword !== undefined){
      sql += ` AND prod_name like '%${keyword}%'`;
    }
    if(fromPrice !== null && fromPrice !== undefined){
      sql += ` AND cast(substr(price, 2) as UNSIGNED) between ${fromPrice} and ${toPrice}`;
    }
    sql += ` limit ${limit} offset ${page}`;
    connection.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let response = {};
    
    response[partTable.toLocaleLowerCase()] = result;
    // Send data as JSON array of objects
    res.status(200).json(response);
  });
  }
});

//update product details (anyone but Customer)
app.patch('/update-product/:upc', (req, res) => {
  
  //Verify if user that is logged in is admin
  let username = req.signedCookies.username;
    
  if (!username) {
      // Cookie is tampered or invalid
      res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
      res.status(400).send('Cookie tampered with or invalid');
      return;
      }
  // Query your database using username
  connection.query('SELECT role FROM users WHERE username = ?', [username], (err, rows) => {
      if (err) {
          // Database error
          res.status(500).send('Internal server error');
          return;
      }
      if (rows.length === 0) {
          // Username does not exist in database
          res.clearCookie('username', {httpOnly: true});
          res.status(400).send('User does not exist');
          return;
      }
      if(rows[0].role==='Customer')
          res.status(403).send('Incorrect Permissions');  
  });

  let upc = req.params.upc;
  let category = req.body.category;
  let newPriceValue = req.body.price;
  let newStockValue = req.body.stock;
  connection.query(`UPDATE ${category} SET price = ?,  stock = ? WHERE upc = ?`, [newPriceValue, newStockValue, upc], function(error){
      if(error) throw error;
      res.status(200).send('success');
  });
});

app.get('/product-cat', (req, res) => {
  const category = req.query.category;
  connection.query(`SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'rbuild' AND TABLE_NAME = '${category}'`, (error, columns) => {
    if (error) throw error;
    connection.query(`SELECT * FROM ${category} ORDER BY RAND() LIMIT 1`, (error, rows) => {
      if (error) throw error;
      res.status(200).json({
        columns: columns.map(column => ({
          name: column.COLUMN_NAME,
          type: column.DATA_TYPE.includes('int') ? 'number' : 'text',
          maxLength: column.CHARACTER_MAXIMUM_LENGTH
        })),
        row: rows[0]
      });
    });
  });
});

// Add product to the database (admin, product manager)
app.post('/insert-product', express.json(), (req, res) => {
  const data = req.body;
  const category = data.category;

  //Verify if user that is logged in is anyone but customer
  let username = req.signedCookies.username;
  
  if (!username) {
      // Cookie is tampered or invalid
      res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
      res.status(400).send('Cookie was tampered wiith or invalid');
      return;
      }

  // Query your database using username
  connection.query('SELECT role FROM users WHERE username = ?', [username], (err, rows) => {
      if (err) {
          // Database error
          res.status(500).send('Internal server error');
          return;
      }
      if (rows.length === 0) {
          // Username does not exist in database
          res.clearCookie('username', {httpOnly: true});
          res.status(400).send('User does not exist');
          return;
      }

      if(rows[0].role!=='Admin' || rows[0].role!=='Manager')
      {
        res.status(500).send('Insufficient Permissions');
        return;
      }
  });

  // First make sure that the upc does not already exist...
  connection.query(`SELECT upc FROM ${category} WHERE upc = ?`, [data.upc], (err, rows) => {
    if (err) {
        // Database error
        res.status(500).send('Internal server error');
        return;
    }
    // New UPC can insert into the table
    if (rows.length === 0) 
    {
      delete data.category;
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data).map(value => `'${value}'`).join(', ');
      connection.query(`INSERT INTO ${category} (${columns}) VALUES (${values})`, (error) => {
        if (error) throw error;
        res.status(201).send('success');
      });
    }

    //UPC already exists
    else
      res.status(400).send('UPC already exists in the table');
  });
});

// Deletes product from database (admin or product manager only)
app.delete('/delete-product/:upc', (req, res) => {
  
  //Verify if user that is logged in as anyone but customer
  let username = req.signedCookies.username;
  
  if (!username) {
      // Cookie is tampered or invalid
      res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
      res.status(400).send('Cookie tampered with or invalid');
      return;
      }
  // Query your database using username
  connection.query('SELECT role FROM users WHERE username = ?', [username], (err, rows) => {
      if (err) {
          // Database error
          res.status(500).send('Internal server error');
          return;
      }
      if (rows.length === 0) {
          // Username does not exist in database
          res.clearCookie('username', {httpOnly: true});
          res.status(400).send('User does not exist in database');
          return;
      }
      if(rows[0].role!=='Admin' || rows[0].role!=='Manager')
        res.status(403).send('Insufficient Permissons');
  });

  let upc = req.params.upc;
  let category = req.body.category;
  connection.query(`DELETE FROM ${category} WHERE upc = ?`, [upc], function(error){
      if(error) throw error;
      res.status(200).send('success');
  });
});

//get all the users to display in user management table (ADMIN ONLY)
app.get('/getusers', (req, res) => {
    //Verify if user that is logged in is admin
    let username = req.signedCookies.username;
    if (!username) {
        // Cookie is tampered or invalid
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.status(400).send('Cookie tampered with or invalid');
        return;
        }
    // Query your database using username
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
        if (err) {
            // Database error
            res.status(500).send('Internal server error');
            return;
        }
        if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.status(400).send('User does not exist');
            return;
        }
        if(username!=='admin')
          res.status(403).send('Insufficent Permissons');
    });

    let sql = 'SELECT * FROM users';
    let query = connection.query(sql, (err, results) => {
        if (err) throw err;
        res.status(200).send(results);
    });
});

// Add transaction with provided upc and quantitiy to the userid
app.post('/addtrans', (req, res) => {
    // Get the parameters from the request body
    const { userid, upc, quantity } = req.body;
    var prod_name, price;

    //First make sure that the user has valid username and cookie
    let cookieUsername = req.signedCookies.username;
    
    if (!cookieUsername) {
        // Cookie is tampered or invalid
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.status(400).send('Cookie tampered with or invalid');
        return;
    }

    // Query your database using cookieUsername
    connection.query('SELECT * FROM users WHERE username = ?', [cookieUsername], (err, rows) => {
        if (err) {
            // Database error
            res.status(500).send('Internal server error');
            return;
        }
        if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.status(400).send('Username does not exist in database');
            return;
        }

          // check if user exists
          connection.query('SELECT * FROM users WHERE userid = ?', [userid], (err1,userExists) => {
            if (err1) {
              console.error(err1);
              res.status(500).send('Internal server error');
              return;
            }
            
            if (userExists.length === 0) {
              res.status(400).send('User does not exist');
              return;
            }
            
            username = userExists[0].username;

            if(username!==cookieUsername)
            {
              res.status(400).send('Cookie and username do not match');
              return;
            }

            else
            {
              // check if product exists
              const tablesToCheck = ['aio_cooler', 'air_cooler', 'cpu', 'cases', 'gpu', 'memory', 'mobo', 'psu', 'storage'];
              let productExists = false;
              
              let tableIndex = 0;
              
              function checkNextTable() {
                  if (productExists || tableIndex >= tablesToCheck.length) {
                      // all tables checked
                      if (!productExists) {
                        return res.status(400).send('Product does not exist');
                      }
                      
                      // insert transaction
                      const date = new Date().toISOString().slice(0,10); // Get the current date in YYYY-MM-DD format
                      const status = 'Pending Shipping'; // Set the status to pending shipping

                      connection.query(
                      `INSERT INTO transactions(userid, upc, prod_name, quantity, price, date, status)
                      VALUES(?,?,?,?,?,?,?)`,
                      [userid, upc, prod_name, quantity, price, date, status],
                      (err3) => {
                          if (err3) {
                          console.error(err3);
                            return res.status(500).send('Internal server error');
                          }
                          
                          res.status(201).send('Transaction added successfully');
                      }
                      );
                      
                  } else {
                      const table = tablesToCheck[tableIndex];
                      tableIndex++;
                      
                      connection.query(`SELECT prod_name, price FROM ${table} WHERE upc = ?`, [upc], (err2,result) => {
                      if (err2) {
                          console.error(err2);
                          return res.status(500).send('Internal server error');
                      }
                      
                      if (result.length > 0) {
                          productExists = true;
                          prod_name = result[0].prod_name;
                          price = result[0].price;
                      }
                      
                      checkNextTable();
                      });
                  }
              }
              
              checkNextTable();
            }
          });
      });
});

//view all orders for specific user
app.get('/view-orders', (req, res) => {
    var userid = req.query.userid;
    
    //First make sure that the user has valid username and cookie
    let cookieUsername = req.signedCookies.username;
    
    if (!cookieUsername) {
        // Cookie is tampered or invalid
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.status(400).send('Cookie tampered with or invalid');
        return;
    }
    
    // Query your database using cookieUsername
    connection.query('SELECT * FROM users WHERE username = ?', [cookieUsername], (err, rows) => {
        if (err) {
            // Database error
            res.status(500).send('Internal server error');
            return;
        }
        if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.status(400).send('Username does not exist in database');
            return;
        }
    });
        
    // check if user exists
    connection.query('SELECT * FROM users WHERE userid = ?', [userid], (err1,userExists) => {
      if (err1) {
        console.error(err1);
        res.status(500).send('Internal server error');
        return;
      }
      
      else if (userExists.length === 0) {
        res.status(400).send('User does not exist');
        return;
      }

      else
      {
        username = userExists[0].username;

        if(username!==cookieUsername)
        {
          res.status(400).send('Cookie and username do not match');
          return;
        }

        else
        {
          // retrieve orders
          connection.query(
            `SELECT transid, upc, quantity, price, date, status FROM transactions WHERE userid = ?`,
            [userid],
            (err2, transactions) => {
              if (err2) {
                console.error(err2);
                res.status(500).send('Internal server error');
                return;
              }
              
              res.status(200).json(transactions);
              return;
            });
        }
      }
    });
});

// Creating a new review for a product
app.post('/create-review', (req, res) => {
    const { userid, upc, rating, comment } = req.body;
    
    // check if product exists
    const tablesToCheck = ['aio_cooler', 'air_cooler', 'cpu', 'cases', 'gpu', 'memory', 'mobo', 'psu', 'storage'];
    let productExists = false;
    let tableIndex = 0;
    let username;
    
    //First make sure that the user has valid username and cookie
    let cookieUsername = req.signedCookies.username;
    
    if (!cookieUsername) {
        // Cookie is tampered or invalid
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.status(400).send('Cookie tampered with or invalid');
        return;
    }
    // Query your database using cookieUsername
    connection.query('SELECT * FROM users WHERE username = ?', [cookieUsername], (err, rows) => {
        if (err) {
            // Database error
            res.status(500).send('Internal server error');
            return;
        }
        if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.status(400).send('Username does not exist in database');
            return;
        }

        else
        {
          // check if user exists
          connection.query('SELECT * FROM users WHERE userid = ?', [userid], (err1,userExists) => {
            if (err1) {
              console.error(err1);
              return res.status(500).send('Internal server error');
            }
            
            if (userExists.length === 0) {
              return res.status(400).send('User does not exist');
            }
            
            username = userExists[0].username;

            if(username!==cookieUsername)
            {
              res.status(400).send('Cookie and username do not match');
              return;
            }
            else
            {
              function checkNextTable() {
                if (productExists || tableIndex >= tablesToCheck.length) {
                  // all tables checked
                  if (!productExists) {
                    return res.status(400).send('Product does not exist');
                  }
                    
                    // check if review already exists
                    connection.query(
                      `SELECT * FROM reviews WHERE userid = ? AND upc = ?`,
                      [userid, upc],
                      (err2,result) => {
                        if (err2) {
                          console.error(err2);
                          return res.status(500).send('Internal server error');
                        }
                        
                        if (result.length > 0) {
                          return res.status(400).send('Review already exists');
                        }
          
                        // check if user has actually purchased the item
                        connection.query(
                          `SELECT * FROM transactions WHERE userid = ? AND upc = ?`,
                          [userid, upc],
                          (err2,result) => {
                            if (err2) {
                              console.error(err2);
                              return res.status(500).send('Internal server error');
                            }
                            
                            if (result.length === 0) {
                              return res.status(400).send('User has not purchased');
                            }
                          
                              // insert review
                              connection.query(
                              `INSERT INTO reviews(userid, username, upc, rating, comment)
                              VALUES(?,?,?,?,?)`,
                              [userid, username, upc, rating, comment],
                              (err3) => {
                              if (err3) {
                                  console.error(err3);
                                  return res.status(500).send('Internal server error');
                              }
                              
                              res.status(201).send('Review added successfully');
                              }
                          );
                          }
                        );
                      }
                    );
            
                } else {
                  const table = tablesToCheck[tableIndex];
                  tableIndex++;
                  
                  connection.query(`SELECT * FROM ${table} WHERE upc = ?`, [upc], (err,result) => {
                    if (err) {
                      console.error(err);
                      return res.status(500).send('Internal server error');
                    }
                    
                    if (result.length > 0) {
                      productExists = true;
                    }
                    
                    checkNextTable();
                  });
                }
              }
            
              checkNextTable();
            }
          });
        } 
    });
});

app.post('/review', (req, res) => {
  const { username, upc, rating, comment } = req.body;
  console.log(req.body);
  if(username == null || username == undefined){
    return res.status(404).send('Unknow username');
  }
  if(upc == null || upc == undefined){
    return res.status(404).send('Unknow upc');
  }
  connection.query('SELECT * FROM users WHERE username = ?', [username], (err1,result) => {
    if (err1) {
      console.error(err1);
      return res.status(500).send('Internal server error');
    }
    
    if (result.length === 0) {
      return res.status(400).send('Product does not have reviews');
    }

    else
    {
      var userid = result[0].userid;
      // retrieve reviews
      connection.query(
        `INSERT INTO reviews(userid, username, upc, rating, comment)
        VALUES(?,?,?,?,?)`,
        [userid, username, upc, rating, comment],
        (err2,reviews) => {
          if (err2) {
            console.error(err2);
            return res.status(500).send('Internal server error');
          }
          
          res.status(200).json("OK");
        });
    }
  });
  
});  
// Viewing a review for specific product upc
app.get('/view-reviews', (req, res) => {
    var upc = req.query.upc; 
 
    // check if product exists in reviews table
    connection.query('SELECT * FROM reviews WHERE upc = ?', [upc], (err1,result) => {
      if (err1) {
        console.error(err1);
        return res.status(500).send('Internal server error');
      }
      
      if (result.length === 0) {
        return res.status(400).send('Product does not have reviews');
      }

      else
      {
        // retrieve reviews
        connection.query(
          `SELECT username, upc, rating, comment FROM reviews WHERE upc = ?`,
          [upc],
          (err2,reviews) => {
            if (err2) {
              console.error(err2);
              return res.status(500).send('Internal server error');
            }
            
            res.status(200).json(reviews);
          });
      }
    });
});  

// Updating a review for specific user and product
app.patch('/edit-review', (req, res) => {
  var userid = req.body.userid;
  var upc = req.body.upc; 
  var newComment = req.body.comment;
  var newRating = req.body.rating;
  // check if product exists in reviews table
  connection.query('SELECT * FROM reviews WHERE userid = ? AND upc = ?', [userid, upc], (err1,result) => {
    if (err1) {
      console.error(err1);
      return res.status(500).send('Internal server error');
    }
    
    else if (result.length === 0) {
      return res.status(400).send('Review for product with this upc does not exist for this user');
    }
    
    else
    {
    //First make sure that the user has valid username and cookie
    let cookieUsername = req.signedCookies.username;
    
    if (!cookieUsername) {
        // Cookie is tampered or invalid
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.status(400).send('Cookie tampered with or invalid');
        return;
    }
    // Query your database using cookieUsername
    connection.query('SELECT * FROM users WHERE username = ?', [cookieUsername], (err, rows) => {
        if (err) {
            // Database error
            res.status(500).send('Internal server error');
            return;
        }
        if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.status(400).send('Username does not exist in database');
            return;
        }
        
        // check if user exists
        connection.query('SELECT * FROM users WHERE userid = ?', [userid], (err1,userExists) => {
          if (err1) {
            console.error(err1);
            return res.status(500).sendd('Internal server error');
          }
          
          if (userExists.length === 0) {
            return res.status(400).send('User does not exist');
          }
          
          const username = userExists[0].username;

          if(username!==cookieUsername)
          {
            res.status(400).send('Cookie and username do not match');
            return;
          }

          // matching username and password
          else
          {
            connection.query('UPDATE reviews SET rating = ?, comment=? WHERE userid=? AND upc=?', [newRating, newComment, userid, upc], function(err2, result){
              if(err2) throw error;
              res.status(200).send('Updated review for the matching user and product');
            });
          }
        });
    });
  }
});  
});

// Deleting a review for specific user and product
app.delete('/delete-review', (req, res) => {
  var userid = req.body.userid;
  var upc = req.body.upc; 
  // check if product exists in reviews table
  connection.query('SELECT * FROM reviews WHERE userid = ? AND upc = ?', [userid, upc], (err1,result) => {
    if (err1) {
      console.error(err1);
      return res.status(500).send('Internal server error');
    }
    
    else if (result.length === 0) {
      return res.status(400).send('Review for product with this upc does not exist for this user');
    }
    
    else
    {
    //First make sure that the user has valid username and cookie
    let cookieUsername = req.signedCookies.username;
    
    if (!cookieUsername) {
        // Cookie is tampered or invalid
        res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
        res.status(400).send('Cookie tampered with or invalid');
        return;
    }
    // Query your database using cookieUsername
    connection.query('SELECT * FROM users WHERE username = ?', [cookieUsername], (err, rows) => {
        if (err) {
            // Database error
            res.status(500).send('Internal server error');
            return;
        }
        if (rows.length === 0) {
            // Username does not exist in database
            res.clearCookie('username', {httpOnly: true});
            res.status(400).send('Username does not exist in database');
            return;
        }
        
        // check if user exists
        connection.query('SELECT * FROM users WHERE userid = ?', [userid], (err1,userExists) => {
          if (err1) {
            console.error(err1);
            return res.status(500).send('Internal server error');
          }
          
          if (userExists.length === 0) {
            return res.status(400).send('User does not exist');
          }
          
          const username = userExists[0].username;

          if(username!==cookieUsername)
          {
            res.status(400).send('Cookie and username do not match');
            return;
          }

          // matching username and password
          else
          {
            // delete the review for the user
            connection.query('DELETE FROM reviews WHERE userid=? AND upc=?', [userid, upc], function(err2, result){
              if(err2) throw error;
              res.status(200).send('Deleted review for matching user and product');
            });
          }
        });
    });
  }
});  
});

// Link company employee with customer
app.post('/link-service', (req, res) => {
  const userid = req.body.userid;
  const request = req.body.request;
  const data = req.body.data;

  // First make sure that the user submitting the request is who they say they are
  //First make sure that the user has valid username and cookie
  let cookieUsername = req.signedCookies.username;
    
  if (!cookieUsername) {
      // Cookie is tampered or invalid
      res.clearCookie('username', {signed: true, httpOnly: true, path: '/'});
      res.status(400).send('Cookie tampered with or invalid');
      return;
  }
  // Query your database using cookieUsername
  connection.query('SELECT * FROM users WHERE username = ?', [cookieUsername], (err, rows) => {
      if (err) {
          // Database error
          res.status(500).send('Internal server error');
          return;
      }
      if (rows.length === 0) {
          // Username does not exist in database
          res.clearCookie('username', {httpOnly: true});
          res.status(400).send('Username does not exist in database');
          return;
      }

      else
      {
        // check if user exists
        connection.query('SELECT * FROM users WHERE userid = ?', [userid], (err1,userExists) => {
          if (err1) {
            console.error(err1);
            return res.status(500).send('Internal server error');
          }
          
          if (userExists.length === 0) {
            return res.status(400).send('User does not exist');
          }
          
          username = userExists[0].username;

          if(username!==cookieUsername)
          {
            res.status(400).send('Cookie and username do not match');
            return;
          }

          else
          {
            // Query the users table to find users with the matching role and online status
            // Initialize an empty array to store the usernames and online statuses
            let users = [];
            // Initialize a variable to store the final username to return
            let employeeUsername = { username: null, online: 0};
            // Query the users table to get the usernames and online statuses of the matching roles
            connection.query('SELECT username, online FROM users WHERE role = ?', [request], (err, results) => {
              if (err) {
                // Handle the error
                console.error(err);
                res.status(500).send('Server error');
              } else {
                // Loop through the results and push them to the users array
                for (let result of results) {
                  users.push({username: result.username, online: result.online});
                }
                // Query the pendingService table to get the counts of each username
                connection.query('SELECT employee, COUNT(*) AS count FROM pendingService WHERE employee IN (?) GROUP BY employee', [users.map(user => user.username)], (err, results) => {
                  if (err) {
                    // Handle the error
                    console.error(err);
                    res.status(500).send('Server error');
                  } else {
                    // Initialize a variable to store the minimum count
                    let minCount = Infinity;
                    // Loop through the users array and assign a count of 0 to each user
                    for (let user of users) {
                      user.count = 0;
                    }
                    // Loop through the results and update the counts of the matching users
                    for (let result of results) {
                      // Find the index of the current username in the users array
                      let index = users.findIndex(user => user.username === result.employee);
                      // Update the count of the user
                      users[index].count = result.count;
                    }
                    // Loop through the users array and compare the counts with the minCount
                    for (let user of users) {
                      
                      // If the count is less than the minCount...
                      /*
                        Cases:
                          1. First entry, just set as the minimum
                          2. Current entry is not online and new entry is online: replace regardless of new entry count
                          3. Current entry is not online and new entry is not online but has lower count
                          4. Current entry is online and new entry is online and has smaller count
                      */
                      
                      // Not first entry 
                      if(employeeUsername.username)
                      {
                          if(employeeUsername.online===0 && user.online===1)
                          {
                            minCount = user.count;
                            employeeUsername.username = user.username;
                            employeeUsername.online = user.online;
                          }

                          if(employeeUsername.online===0 && user.online===0 && user.count < minCount)
                          {
                            minCount = user.count;
                            employeeUsername.username = user.username;
                            employeeUsername.online = user.online;
                          }

                          if(employeeUsername.online===1 && user.online===1 && user.ocunt < minCount)
                          {
                            minCount = user.count;
                            employeeUsername.username = user.username;
                            employeeUsername.online = user.online;
                          }
                      }

                      // First entry
                      else
                      {
                        minCount = user.count;
                        employeeUsername.username = user.username;
                        employeeUsername.online = user.online;
                      }
                    }
                    
                    if(employeeUsername.username)
                    {
                      // Update the service table
                      const date = new Date().toISOString().slice(0,10); // Get the current date in YYYY-MM-DD format
                      connection.query('INSERT INTO pendingService (employee, customer, request, date, data) VALUES (?, ?, ?, ?, ?)', [employeeUsername.username, username, request, date, data], function(error){
                        if(error) throw error;
                        res.status(201).send('Request successfully created with ' + employeeUsername.username);
                    });
                    }

                    else
                      res.status(400).send('No employee found for the request')
                  }
                });
              }
          });  
          }
      });
      }
  });
});

console.log("Server started!");
app.listen(3000);
