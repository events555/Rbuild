const YOUR_DOMAIN = 'http://localhost:3000';
const stripe = require('stripe')('sk_test_51MiU4xLGe3DYUFyZAHJjWk6FWztmtnjTwjNvzEGQpZCWqyqDbe5Lr3Iag442Nu0mzdEwiRvYFjw5vVhCFfFPG55M00DXkYvohM')

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
    app.post('/create-checkout-session', async(req, res) => {
        const userid = req.cookies.userId;
        const selectQuery = 'SELECT prod_name, quantity, price FROM cart WHERE userid = ?';
        connection.query(selectQuery, [userid], async (error, results) => {
          if (error) {
            res.status(500).send(error);
          } else {
            console.log(results);
            const lineItems = results.map(item => ({
              price_data: {
                currency: 'usd',
                product_data: {
                  name: item.prod_name,
                },
                unit_amount: item.price * 100, // expects price in pennies ($0.01)
              },
              quantity: item.quantity,
            }));
            const session = await stripe.checkout.sessions.create({
              line_items: lineItems,
              mode: 'payment',
              success_url: `${YOUR_DOMAIN}/success.html`,
              cancel_url: `${YOUR_DOMAIN}/`,
            });
            res.redirect(303, session.url);
          }
        });
    });
}