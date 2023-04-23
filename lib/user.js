module.exports = function(app, connection) {
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
})
};