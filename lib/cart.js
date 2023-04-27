const YOUR_DOMAIN = "http://localhost:3000";
const stripe = require("stripe")(
  "sk_test_51MiU4xLGe3DYUFyZAHJjWk6FWztmtnjTwjNvzEGQpZCWqyqDbe5Lr3Iag442Nu0mzdEwiRvYFjw5vVhCFfFPG55M00DXkYvohM"
);
const endpointSecret = "whsec_17b2483b8c52fcac9545b50692d514d8d0702db1447c480e0b789f12c9b9c1b5"
const path = require("path");
const express = require('express');
const bodyParser = require("body-parser");
module.exports = function (app, connection) {
  app.post("/cart/add", (req, res) => {
    const upc = req.body.upc;
    const price = req.body.price;
    const userid = req.cookies.userId;
    const name = req.body.name;
    const selectQuery = "SELECT * FROM cart WHERE upc = ? AND userid = ?";
    connection.query(selectQuery, [upc, userid], (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else if (results.length > 0) {
        const updateQuery =
          "UPDATE cart SET quantity = quantity + 1 WHERE upc = ? AND userid = ?";
        connection.query(updateQuery, [upc, userid], (error) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.send("Item quantity updated");
          }
        });
      } else {
        const insertQuery =
          "INSERT INTO cart (prod_name, upc, price, quantity, userid) VALUES (?, ?, ?, 1, ?)";
        connection.query(insertQuery, [name, upc, price, userid], (error) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.send("Item added to cart");
          }
        });
      }
    });
  });
  app.post("/cart/remove", (req, res) => {
    const userid = req.cookies.userId;
    const name = req.body.name;
    const selectQuery = "SELECT * FROM cart WHERE prod_name = ? AND userid = ?";
    connection.query(selectQuery, [name, userid], (error) => {
      if (error) {
        console.log(name);
        res.status(500).send(error);
      } else {
        const updateQuery =
          "DELETE FROM cart WHERE prod_name = ? AND userid = ?";
        connection.query(updateQuery, [name, userid], (error) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.send("Item removed");
          }
        });
      }
    });
  });
  app.post("/cart/incr", (req, res) => {
    const userid = req.cookies.userId;
    const name = req.body.name;
    const selectQuery = "SELECT * FROM cart WHERE prod_name = ? AND userid = ?";
    connection.query(selectQuery, [name, userid], (error) => {
      if (error) {
        console.log(name);
        res.status(500).send(error);
      } else {
        const updateQuery =
          "UPDATE cart SET quantity = quantity + 1 WHERE prod_name = ? AND userid = ?";
        connection.query(updateQuery, [name, userid], (error) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.send("Item quantity incremented");
          }
        });
      }
    });
  });
  app.post("/cart/decr", (req, res) => {
    const userid = req.cookies.userId;
    const name = req.body.name;
    const selectQuery = "SELECT * FROM cart WHERE prod_name = ? AND userid = ?";
    connection.query(selectQuery, [name, userid], (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        if (results[0].quantity > 1) {
          const updateQuery =
            "UPDATE cart SET quantity = quantity - 1 WHERE prod_name = ? AND userid = ?";
          connection.query(updateQuery, [name, userid], (error) => {
            if (error) {
              res.status(500).send(error);
            } else {
              res.send("Item decremented");
            }
          });
        } else {
          const deleteQuery =
            "DELETE FROM cart WHERE prod_name = ? AND userid = ?";
          connection.query(deleteQuery, [name, userid], (error) => {
            if (error) {
              res.status(500).send(error);
            } else {
              res.send("Item removed");
            }
          });
        }
      }
    });
  });
  app.get("/cart", (req, res) => {
    const userid = req.cookies.userId;
    const selectQuery =
      "SELECT prod_name, quantity, price FROM cart WHERE userid = ?";
    connection.query(selectQuery, [userid], (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.json(results);
      }
    });
  });
  app.get("/manual_builder", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "man_build.html"));
  });
  app.post("/create-checkout-session", async (req, res) => {
    const userid = req.cookies.userId;
    const selectQuery = "SELECT prod_name, quantity, price, upc FROM cart WHERE userid = ?";
    connection.query(selectQuery, [userid], async (error, results) => {
      if (error) {
        res.status(500).send(error);
      } else {
        console.log(results);
        const lineItems = results.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.prod_name,
            },
            unit_amount: item.price * 100, // expects price in pennies ($0.01)
          },
          quantity: item.quantity,
        }));
        const upcCodes = results.map((item) => item.upc); // Get array of UPC codes from cart database
        const prodNames = results.map((item) => item.prod_name); // Get array of product names from cart database
        const quantities = results.map((item) => item.quantity); // Get array of quantities from cart database
        const prices = results.map((item) => item.price); // Get array of prices from cart database
        const metadata = { userId: userid };
        for (let i = 0; i < upcCodes.length; i++) {
          metadata[`upcCode${i}`] = upcCodes[i];
          metadata[`prodName${i}`] = prodNames[i];
          metadata[`quantity${i}`] = quantities[i].toString();
          metadata[`price${i}`] = prices[i].toString();
        }
        console.log(metadata);
        const session = await stripe.checkout.sessions.create({
          line_items: lineItems,
          mode: "payment",
          success_url: `${YOUR_DOMAIN}/thank_you.html`,
          cancel_url: `${YOUR_DOMAIN}/`,
          metadata: metadata, // Pass along userId, upcCodes, prodNames, quantities and prices as metadata with string values
        });
        res.redirect(303, session.url);
      }
    });
  });
  app.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
      const sig = request.headers['stripe-signature'];

      let event;
    
      try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
          break;
        case 'checkout.session.completed':
            console.log('Checkout session completed!')
            const session = event.data.object;
            // Get transaction information from session object
            const transactionId = session.payment_intent;
            // Get userId, upcCodes, prodNames, quantities and prices from session metadata
            const userId = session.metadata.userId;
            const upcCodes = session.metadata.upcCodes;
            const prodNames = session.metadata.prodNames;
            const quantities = session.metadata.quantities;
            const prices = session.metadata.prices;
            console.log('Metadata retrieved from session object')
            // Insert transaction information into SQL database
            for (let i = 0; i < upcCodes.length; i++) {
              const upc = upcCodes[i];
              const prodName = prodNames[i];
              const quantity = quantities[i];
              const price = prices[i]; // Get price from metadata
              const date = new Date();
              const status = 'completed';
              const insertQuery = 'INSERT INTO transactions (transid, userid, upc, prod_name, quantity, price, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
              connection.query(insertQuery, [transactionId, userId, upc, prodName, quantity, price, date, status], (error, results) => {
                if (error) {
                  response.status(500).send(error);
                } else {
                  console.log('Transaction inserted into database from webhook');
                }
            });
            }
          break;
        default:
          console.log(`Unhandled event type ${event.type}.`);
      }
      console.log("Webhook received!");
      response.send();
  });
};
