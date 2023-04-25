
module.exports = function (app, connection) {
    app.post('/cart/add', (req, res) => {
        const upc = req.body.upc;
        const price = req.body.price;
        const userid = req.cookies.userId;
        const name = req.body.name;
        const selectQuery = 'SELECT * FROM cart WHERE upc = ? AND userid = ?';
        connection.query(selectQuery, [upc, userid], (error, results) => {
            if (error) {
                res.status(500).send(error);
            } else if (results.length > 0) {
                const updateQuery = 'UPDATE cart SET quantity = quantity + 1 WHERE upc = ? AND userid = ?';
                connection.query(updateQuery, [upc, userid], (error) => {
                    if (error) {
                        res.status(500).send(error);
                    } else {
                        res.send('Item quantity updated');
                    }
                });
            } else {
                const insertQuery = 'INSERT INTO cart (prod_name, upc, price, quantity, userid) VALUES (?, ?, ?, 1, ?)';
                connection.query(insertQuery, [name, upc, price, userid], (error) => {
                    if (error) {
                        res.status(500).send(error);
                    } else {
                        res.send('Item added to cart');
                    }
                });
            }
        });
    });
    app.get('/cart', (req, res) => {
        const userid = req.cookies.userId;
        console.log(userid);
        const selectQuery = 'SELECT prod_name, quantity, price FROM cart WHERE userid = ?';
        connection.query(selectQuery, [userid], (error, results) => {
            if (error) {
                res.status(500).send(error);
            } else {
                console.log(results);
                res.json(results);
            }
        });
    });
    
/*
connection.query(
  'SELECT * FROM products',
  function(err, results) {
    if (err) throw err;
    results.forEach(product => {
      stripe.products.create({
        name: product.name,
        // other properties from product object
      });
    });
  }
);
*/
}