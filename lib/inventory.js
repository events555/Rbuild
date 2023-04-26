const express = require("express");
const path = require("path");
module.exports = function (app, connection) {
  // Retrieve part that the client wants and forward the data
  app.get("/product", (req, res) => {
    var partTable = req.query.part;
    var limit = 10;
    limit = req.query.limit;
    if (limit == undefined) limit = 10;
    var page = 0;
    page = req.query.page;
    if (page == undefined) page = 0;
    //query all databases
    if (partTable === "all") {
      const tables = [
        "aio_cooler",
        "air_cooler",
        "cpu",
        "cases",
        "gpu",
        "memory",
        "mobo",
        "psu",
        "storage",
      ];
      let result = {};
      let count = 0;
      tables.forEach((table) => {
        connection.query(
          `SELECT * FROM ${table} limit ${limit} offset ${page}`,
          (error, rows) => {
            if (error) throw error;
            result[table] = rows.map((row) => ({ ...row, table }));
            count++;
            if (count === tables.length) {
              res.status(200).json(result);
            }
          }
        );
      });
    }

    //query a single database
    else {
      let sql = "SELECT * FROM " + partTable;
      connection.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        // Send data as JSON array of objects
        res.status(200).json(result);
      });
    }
  });
  app.post("/product/:name", (req, res) => {
    const name = req.params.name;
    const exclude = req.body.exclude;
    //query all databases
    const tables = [
      "aio_cooler",
      "air_cooler",
      "cpu",
      "cases",
      "gpu",
      "memory",
      "mobo",
      "psu",
      "storage",
    ];
    let products = [];
    let queryCount = 0;
    for (const table of tables) {
      connection.query(
        `SELECT prod_name FROM ${table} WHERE prod_name LIKE ?`,
        [`%${name}%`],
        (error, results) => {
          if (error) throw error;
          if (table === "aio_cooler" || table === "air_cooler")
            val = "cpu_cooler";
          else val = table;
          products = products.concat(
            results
              .map((result) => ({ prod_name: result.prod_name, category: val }))
              .filter((product) => {
                if (
                  product.category === "storage" ||
                  product.category === "memory"
                ) {
                  return true;
                }
                let excludeCategories = exclude.map((item) => item.category);
                return !excludeCategories.includes(product.category);
              })
          );

          queryCount++;
          if (queryCount === tables.length) {
            res.json(products);
          }
        }
      );
    }
  });

  //update product details (anyone but Customer)
  app.patch("/update-product/:upc", (req, res) => {
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
      "SELECT role FROM users WHERE username = ?",
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
          res.status(400).send("User does not exist");
          return;
        }
        if (rows[0].role === "Customer")
          res.status(403).send("Incorrect Permissions");
      }
    );

    let upc = req.params.upc;
    let category = req.body.category;
    let newPriceValue = req.body.price;
    let newStockValue = req.body.stock;
    connection.query(
      `UPDATE ${category} SET price = ?,  stock = ? WHERE upc = ?`,
      [newPriceValue, newStockValue, upc],
      function (error) {
        if (error) throw error;
        res.status(200).send("success");
      }
    );
  });

  app.post("/checkStock/:upc", (req, res) => {
    let upc = req.params.upc;
    const { quantity } = req.body;

    const tablesToCheck = [
      "aio_cooler",
      "air_cooler",
      "cpu",
      "cases",
      "gpu",
      "memory",
      "mobo",
      "psu",
      "storage",
    ];
    let productExists = false;
    let tableIndex = 0;
    let prod_stock = 0;
    let prod_table;

    function checkNextTable() {
      if (productExists || tableIndex >= tablesToCheck.length) {
        // all tables checked
        if (!productExists) {
          return res.status(400).send("Product does not exist");
        }

        if (prod_stock - quantity >= 0) {
          return res.status(201).send("Product in stock");
        } else return res.status(400).send("Product out of stock");
      } else {
        const table = tablesToCheck[tableIndex];
        tableIndex++;

        connection.query(
          `SELECT stock FROM ${table} WHERE upc = ?`,
          [upc],
          (err2, result) => {
            if (err2) {
              console.error(err2);
              return res.status(500).send("Internal server error");
            }

            if (result.length > 0) {
              productExists = true;
              prod_stock = result[0].stock;
              prod_table = table;
            }

            checkNextTable();
          }
        );
      }
    }

    checkNextTable();
  });

  // Add transaction with provided upc and quantitiy to the userid
  app.post("/reserveProduct/:upc", (req, res) => {
    // Get the parameters from the request body
    const { userid, quantity } = req.body;
    var prod_name, prod_table, price, stock;
    let upc = req.params.upc;

    //First make sure that the user has valid username and cookie
    let cookieUsername = req.signedCookies.username;

    if (!cookieUsername) {
      // Cookie is tampered or invalid
      res.clearCookie("username", { signed: true, httpOnly: true, path: "/" });
      res.status(400).send("Cookie tampered with or invalid");
      return;
    }

    // Query your database using cookieUsername
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
          res.status(400).send("Username does not exist in database");
          return;
        }

        // check if user exists
        connection.query(
          "SELECT * FROM users WHERE userid = ?",
          [userid],
          (err1, userExists) => {
            if (err1) {
              console.error(err1);
              res.status(500).send("Internal server error");
              return;
            }

            if (userExists.length === 0) {
              res.status(400).send("User does not exist");
              return;
            }

            username = userExists[0].username;

            if (username !== cookieUsername) {
              res.status(400).send("Cookie and username do not match");
              return;
            } else {
              // check if product exists
              const tablesToCheck = [
                "aio_cooler",
                "air_cooler",
                "cpu",
                "cases",
                "gpu",
                "memory",
                "mobo",
                "psu",
                "storage",
              ];
              let productExists = false;

              let tableIndex = 0;

              function checkNextTable() {
                if (productExists || tableIndex >= tablesToCheck.length) {
                  // all tables checked
                  if (!productExists) {
                    return res.status(400).send("Product does not exist");
                  }

                  // first make sure that the product is in stock...
                  if (stock - quantity >= 0) {
                    connection.query(
                      `UPDATE ${prod_table} SET stock = ? WHERE upc = ?`,
                      [stock - quantity, upc],
                      (err2, result) => {
                        if (err2) {
                          console.error(err2);
                          return res.status(500).send("Internal server error");
                        } else {
                          // insert transaction
                          const date = new Date().toISOString().slice(0, 10); // Get the current date in YYYY-MM-DD format
                          const status = "Pending Shipping"; // Set the status to pending shipping

                          connection.query(
                            `INSERT INTO transactions(userid, upc, prod_name, quantity, price, date, status)
                            VALUES(?,?,?,?,?,?,?)`,
                            [
                              userid,
                              upc,
                              prod_name,
                              quantity,
                              price,
                              date,
                              status,
                            ],
                            (err3) => {
                              if (err3) {
                                console.error(err3);
                                return res
                                  .status(500)
                                  .send("Internal server error");
                              }

                              res
                                .status(201)
                                .send("Product reserved successfully");
                            }
                          );
                        }
                      }
                    );
                  } else
                    return res
                      .status(400)
                      .send("Product could not be reserved");
                } else {
                  const table = tablesToCheck[tableIndex];
                  tableIndex++;

                  connection.query(
                    `SELECT prod_name, stock, price FROM ${table} WHERE upc = ?`,
                    [upc],
                    (err2, result) => {
                      if (err2) {
                        console.error(err2);
                        return res.status(500).send("Internal server error");
                      }

                      if (result.length > 0) {
                        productExists = true;
                        prod_table = table;
                        prod_name = result[0].prod_name;
                        stock = result[0].stock;
                        price = result[0].price;
                      }

                      checkNextTable();
                    }
                  );
                }
              }

              checkNextTable();
            }
          }
        );
      }
    );
  });

  app.get("/product-cat", (req, res) => {
    const category = req.query.category;
    connection.query(
      `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'rbuild' AND TABLE_NAME = '${category}'`,
      (error, columns) => {
        if (error) throw error;
        connection.query(
          `SELECT * FROM ${category} ORDER BY RAND() LIMIT 1`,
          (error, rows) => {
            if (error) throw error;
            res.status(200).json({
              columns: columns.map((column) => ({
                name: column.COLUMN_NAME,
                type: column.DATA_TYPE.includes("int") ? "number" : "text",
                maxLength: column.CHARACTER_MAXIMUM_LENGTH,
              })),
              row: rows[0],
            });
          }
        );
      }
    );
  });

  // Add product to the database (admin, product manager)
  app.post("/insert-product", express.json(), (req, res) => {
    const data = req.body;
    const category = data.category;

    //Verify if user that is logged in is anyone but customer
    let username = req.signedCookies.username;

    if (!username) {
      // Cookie is tampered or invalid
      res.clearCookie("username", { signed: true, httpOnly: true, path: "/" });
      res.status(400).send("Cookie was tampered wiith or invalid");
      return;
    }

    // Query your database using username
    connection.query(
      "SELECT role FROM users WHERE username = ?",
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
          res.status(400).send("User does not exist");
          return;
        }

        if (rows[0].role !== "Admin" || rows[0].role !== "Manager") {
          res.status(500).send("Insufficient Permissions");
          return;
        }
      }
    );

    // First make sure that the upc does not already exist...
    connection.query(
      `SELECT upc FROM ${category} WHERE upc = ?`,
      [data.upc],
      (err, rows) => {
        if (err) {
          // Database error
          res.status(500).send("Internal server error");
          return;
        }
        // New UPC can insert into the table
        if (rows.length === 0) {
          delete data.category;
          const columns = Object.keys(data).join(", ");
          const values = Object.values(data)
            .map((value) => `'${value}'`)
            .join(", ");
          connection.query(
            `INSERT INTO ${category} (${columns}) VALUES (${values})`,
            (error) => {
              if (error) throw error;
              res.status(201).send("success");
            }
          );
        }

        //UPC already exists
        else res.status(400).send("UPC already exists in the table");
      }
    );
  });

  // Deletes product from database (admin or product manager only)
  app.delete("/delete-product/:upc", (req, res) => {
    //Verify if user that is logged in as anyone but customer
    let username = req.signedCookies.username;

    if (!username) {
      // Cookie is tampered or invalid
      res.clearCookie("username", { signed: true, httpOnly: true, path: "/" });
      res.status(400).send("Cookie tampered with or invalid");
      return;
    }
    // Query your database using username
    connection.query(
      "SELECT role FROM users WHERE username = ?",
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
          res.status(400).send("User does not exist in database");
          return;
        }
        if (rows[0].role !== "Admin" || rows[0].role !== "Manager")
          res.status(403).send("Insufficient Permissons");
      }
    );

    let upc = req.params.upc;
    let category = req.body.category;
    connection.query(
      `DELETE FROM ${category} WHERE upc = ?`,
      [upc],
      function (error) {
        if (error) throw error;
        res.status(200).send("success");
      }
    );
  });

  // Retrieve part that the client wants and forward the data
  app.get("/product-detail", (req, res) => {
    var partTable = req.query.category;
    var upc = req.query.upc;
    if (upc == null || partTable == null)
      return res.status(404).json("INvalid Request!");

    response = {};
    let sql = "SELECT * FROM " + partTable + " where upc = '" + upc + "'";
    connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      // Send data as JSON array of objects
      response["product"] = result;
      console.log(response);
    });

    connection.query(
      `SELECT * FROM reviews where upc = ${upc}`,
      (err, result) => {
        if (err) {
          throw err;
        }
        // Send data as JSON array of objects
        response["reviews"] = result;
        res.status(200).json(response);
      }
    );
  });

  // Retrieve part that the client wants and forward the data
  app.get("/search-product", (req, res) => {
    var partTable = req.query.category;
    var keyword = req.query.keyword;
    var memory = req.query.memory;
    var storage = req.query.storage;
    var cpu = req.query.cpu;
    var fromPrice = req.query.fromPrice;
    var toPrice = req.query.toPrice;

    var limit = 10;
    limit = req.query.limit;
    if (limit == undefined) limit = 10;
    var page = 0;
    page = req.query.page;
    if (page == undefined) page = 0;

    if (memory !== null && memory !== undefined) {
      limit = 10;
      let sql = `SELECT * FROM memory where mem_type = '${memory}'`;
      if (keyword !== null && keyword !== undefined) {
        sql += ` AND prod_name like '%${keyword}%'`;
      }
      if (fromPrice !== null && fromPrice !== undefined) {
        sql += ` AND cast(substr(price, 2) as UNSIGNED) between ${fromPrice} and ${toPrice}`;
      }
      sql += ` limit ${limit} offset ${page}`;
      connection.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        let response = {};
        response["memory"] = result;
        // Send data as JSON array of objects
        res.status(200).json(response);
      });
      return;
    }

    if (storage !== null && storage !== undefined) {
      limit = 10;
      let sql = `SELECT * FROM storage where capacity = '${storage}'`;
      if (keyword !== null && keyword !== undefined) {
        sql += ` AND prod_name like '%${keyword}%'`;
      }
      if (fromPrice !== null && fromPrice !== undefined) {
        sql += ` AND cast(substr(price, 2) as UNSIGNED) between ${fromPrice} and ${toPrice}`;
      }
      sql += ` limit ${limit} offset ${page}`;
      connection.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        let response = {};
        response["storage"] = result;
        // Send data as JSON array of objects
        res.status(200).json(response);
      });
      return;
    }

    if (cpu !== null && cpu !== undefined) {
      limit = 10;
      let sql = `SELECT * FROM cpu where prod_name like '%${cpu}%'`;
      if (keyword !== null && keyword !== undefined) {
        sql += ` AND prod_name like '%${keyword}%'`;
      }
      if (fromPrice !== null && fromPrice !== undefined) {
        sql += ` AND cast(substr(price, 2) as UNSIGNED) between ${fromPrice} and ${toPrice}`;
      }
      sql += ` limit ${limit} offset ${page}`;
      connection.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        let response = {};
        response["cpu"] = result;
        // Send data as JSON array of objects
        res.status(200).json(response);
      });
      return;
    }

    if (keyword === null || keyword === undefined) {
      keyword = " ";
    }
    //query all databases
    if (partTable === "all" || partTable === null || partTable === undefined) {
      const tables = [
        "aio_cooler",
        "air_cooler",
        "cpu",
        "cases",
        "gpu",
        "memory",
        "mobo",
        "psu",
        "storage",
      ];
      let result = {};
      let count = 0;
      tables.forEach((table) => {
        var sql = `SELECT * FROM ${table} where prod_name like '%${keyword}%' limit ${limit} offset ${page}`;

        connection.query(sql, (error, rows) => {
          if (error) throw error;
          result[table] = rows.map((row) => ({ ...row, table }));
          count++;
          if (count === tables.length) {
            res.status(200).json(result);
          }
        });
      });
    }

    //query a single database
    else {
      let sql = "SELECT * FROM " + partTable + " where 1 = 1 ";
      if (keyword !== null && keyword !== undefined) {
        sql += ` AND prod_name like '%${keyword}%'`;
      }
      if (fromPrice !== null && fromPrice !== undefined) {
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

  app.get("/manage_product", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "product_manage.html"));
  });
};
