const express = require('express');

module.exports = function(app, connection){
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
}