module.exports = function (app, connection) {

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
  
};