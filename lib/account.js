const bycrypt = require("bcrypt");
const saltRounds = 10;

module.exports = function (app, connection) {
  //login cookie check
  app.get("/check-cookie", (req, res) => {
    let username = req.signedCookies.username;

    if (!username) {
      // Cookie is tampered or invalid
      res.clearCookie("username", { signed: true, httpOnly: true, path: "/" });
      res.status(401).send({ loggedIn: "invalid" });
      return;
    }
    // Query your database using username
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, rows) => {
        if (err) {
          // Database error
          res.status(500).send({ loggedIn: "failure" });
          return;
        }
        if (rows.length === 0) {
          // Username does not exist in database
          res.clearCookie("username", { httpOnly: true });
          res.status(401).send({ loggedIn: "failure" });
          return;
        }

        //successful login
        connection.query(
          "UPDATE users SET online = ? WHERE username = ?",
          [1, username],
          function (error) {
            if (error) throw error;
          }
        );

        var toSend = {
          loggedIn: "success",
          username: username,
        };
        var sendResult = JSON.stringify(toSend);
        res.status(200).send(sendResult);
      }
    );
  });

  //login cookie check
  app.get("/admin-check-cookie", (req, res) => {
    let username = req.signedCookies.username;

    if (!username) {
      // Cookie is tampered or invalid
      res.clearCookie("username", { signed: true, httpOnly: true, path: "/" });
      res.status(401).send({ loggedIn: "invalid" });
      return;
    }
    // Query your database using username
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, rows) => {
        if (err) {
          // Database error
          res.status(500).send({ loggedIn: "failure" });
          return;
        }
        if (rows.length === 0) {
          // Username does not exist in database
          res.clearCookie("username", { httpOnly: true });
          res.status(401).send({ loggedIn: "failure" });
          return;
        }
        if (username === "admin") {
          connection.query(
            "UPDATE users SET online = ? WHERE username = ?",
            [1, username],
            function (error) {
              if (error) throw error;
              res.status(200).send({ loggedIn: "success" });
            }
          );
        }
      }
    );
  });

  //login post request
  app.post("/login", function (req, res) {
    // Get the username and password from the request
    const username = req.body.username;
    const password = req.body.password;

    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      function (error, results) {
        if (error) throw error;

        if (results.length > 0 && username === "admin") {
          bycrypt.compare(
            password,
            results[0].password,
            function (err, result) {
              if (result == true) {
                //console.log("username: " + username + "; password: " + password + "; login status: success");

                //create the cookie
                res.cookie("username", username, {
                  signed: true,
                  httpOnly: true,
                  path: "/",
                });

                //send success and username
                //set status to online
                connection.query(
                  "UPDATE users SET online = ? WHERE username = ?",
                  [1, username],
                  function (error) {
                    if (error) throw error;
                    res.status(200).send(username);
                  }
                );
              } else {
                //console.log("username: " + username + "; password: " + password + "; login status: failure");
                res.status(400).send("Failed login");
              }
            }
          );
        } else if (results.length > 0) {
          bycrypt.compare(
            password,
            results[0].password,
            function (err, result) {
              if (result == true) {
                //create the cookie and send the username
                res.cookie("username", username, {
                  signed: true,
                  httpOnly: true,
                  path: "/",
                });

                connection.query(
                  "UPDATE users SET online = ? WHERE username = ?",
                  [1, username],
                  function (error) {
                    if (error) throw error;
                    res.status(200).send(username);
                  }
                );
              } else res.status(400).send("Incorrect login");
            }
          );
        } else {
          res.status(400).send("User was not found");
        }
      }
    );
  });

  //register post request
  app.post("/register", function (req, res) {
    // Get the username and password from the request
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
      var passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      var isValid = passwordRegex.test(password);

      connection.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        function (error, results) {
          if (error) throw error;
          else if (results.length > 0)
            res.status(400).send("Account already exists");
          else {
            if (isValid) {
              bycrypt.hash(password, saltRounds, function (err, hash) {
                if (err) throw err;

                //no role specified
                if (!req.body.role) {
                  connection.query(
                    "INSERT INTO users (username, password) VALUES (?, ?)",
                    [username, hash],
                    function (error) {
                      if (error) throw error;
                      res
                        .status(201)
                        .send("New user created with default role Customer");
                    }
                  );
                }

                //role specified
                else {
                  connection.query(
                    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                    [username, hash, req.body.role],
                    function (error) {
                      if (error) throw error;
                      res
                        .status(201)
                        .send("New user created with role " + req.body.role);
                    }
                  );
                }
              });
            } else
              res
                .status(400)
                .send(
                  "Password must...<br>- Be at least 8 characters<br>- Contain 1 lower & uppercase leter<br>- Contain 1 digit & 1 symbol"
                );
          }
        }
      );
    } else res.status(400).send("Incomplete Submission");
  });

  app.put("/logout", function (req, res) {
    //Verify if user that is logged in is anyone but customer
    let cookieUsername = req.signedCookies.username;
    if (!cookieUsername) {
      // Cookie is tampered or invalid
      res.clearCookie("username", { signed: true, httpOnly: true, path: "/" });
      res.status(400).send("Cookie was tampered with or invalid");
      return;
    }

    // Query your database using username
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [cookieUsername],
      (err, rows) => {
        if (err) {
          // Database error
          res.status(500).send("Internal server error");
          return;
        }
        if (rows.length === 0) {
          // Username does not exist in database
          res.clearCookie("username", { httpOnly: true });
          res.status(400).send("User does not exist");
          return;
        }
        // Successful logout: delete user cookie and then set status online to 0
        connection.query(
          "UPDATE users SET online = ? WHERE username = ?",
          [0, cookieUsername],
          function (error) {
            if (error) throw error;
            res.clearCookie("username", {
              signed: true,
              httpOnly: true,
              path: "/",
            });
            res.status(200).send("User has successfully logged out");
          }
        );
      }
    );
  });

  app.get("/getuserid", function (req, res) {
    var wantID = req.query.username;
    connection.query(
      "SELECT userid FROM users WHERE username = ?",
      [wantID],
      (err, result) => {
        if (err) {
          throw err;
        }
        // Send data as JSON array of objects
        res.status(200).json(result[0]);
      }
    );
  });

  app.get("/getrole", function (req, res) {
    var wantRole = req.query.username;
    connection.query(
      "SELECT role FROM users WHERE username = ?",
      [wantRole],
      (err, result) => {
        if (err) {
          throw err;
        }
        // Send data as JSON array of objects
        res.status(200).json(result[0]);
      }
    );
  });

  // Reset the auto-incremenet (ADMIN ONLY)
  app.patch("/autoincrement", (req, res) => {
    //Verify if user that is logged in is admin
    let username = req.signedCookies.username;

    if (!username) {
      // Cookie is tampered or invalid
      res.clearCookie("username", { signed: true, httpOnly: true, path: "/" });
      res.status(200).send("Cookie tampered with or invalid");
      return;
    }
    // Query your database using username
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, rows) => {
        if (err) {
          // Database error
          res.status(400).send("Internal server error");
          return;
        } else if (rows.length === 0) {
          // Username does not exist in database
          res.clearCookie("username", { httpOnly: true });
          res.status(400).send("User does not exist");
          return;
        } else if (username !== "admin") res.status(403).send("failure");

        connection.query(
          "ALTER TABLE users AUTO_INCREMENT = 1",
          function (error) {
            if (error) throw error;
            res.status(200).send("success");
          }
        );
      }
    );
  });

  // Deletes user from database (ADMIN ONLY)
  app.delete("/deleteuser/:userid", (req, res) => {
    //Verify if user that is logged in is admin
    let username = req.signedCookies.username;

    if (!username) {
      // Cookie is tampered or invalid
      res.clearCookie("username", { signed: true, httpOnly: true, path: "/" });
      res.status(400).send("Cookie tampered with or invalid");
      return;
    }
    // Query your database using username
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, rows) => {
        if (err) {
          // Database error
          res.status(500).send("Internal server error");
          return;
        } else if (rows.length === 0) {
          // Username does not exist in database
          res.clearCookie("username", { httpOnly: true });
          res.status(400).send("User does not exist");
          return;
        } else if (username !== "admin") res.status(403).send("failure");
      }
    );

    let userid = req.params.userid;
    connection.query(
      "DELETE FROM users WHERE userid = ?",
      [userid],
      function (error) {
        if (error) throw error;
        res.status(200).send("success");
      }
    );
  });

  // Updates user's role in database (ADMIN ONLY)
  app.patch("/updateuser/:userid", (req, res) => {
    //Verify if user that is logged in is admin
    let username = req.signedCookies.username;

    if (!username) {
      // Cookie is tampered or invalid
      res.clearCookie("username", { signed: true, httpOnly: true, path: "/" });
      res.status(400).send("Cookie tampered with or invalid");
      return;
    }
    // Query your database using username
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, rows) => {
        if (err) {
          // Database error
          res.status(500).send("Internal server error");
          return;
        }
        if (rows.length === 0) {
          // Username does not exist in database
          res.clearCookie("username", { httpOnly: true });
          res.status(403).send("User does not exist");
          return;
        }
        if (username !== "admin") {
          res.status(403).send("failure");
        }
      }
    );

    let userid = req.params.userid;
    let newRoleValue = req.body.role;
    connection.query(
      "UPDATE users SET role = ? WHERE userid = ?",
      [newRoleValue, userid],
      function (error) {
        if (error) throw error;
        res.status(200).send("success");
      }
    );
  });
};
