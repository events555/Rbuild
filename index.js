const express = require('express');
const puppeteer = require('puppeteer');
const app = express()
const port = 3000
const stripe = require('stripe')('sk_test_51MiU4xLGe3DYUFyZAHJjWk6FWztmtnjTwjNvzEGQpZCWqyqDbe5Lr3Iag442Nu0mzdEwiRvYFjw5vVhCFfFPG55M00DXkYvohM')
const pageURL =
    'https://www.newegg.com/intel-core-i5-12600k-core-i5-12th-gen/p/N82E16819118347?Description=processors&cm_re=processors-_-19-118-347-_-Product';

var mysql = require('mysql');
const YOUR_DOMAIN = 'http://localhost/:$%7Bport%7D';

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "parts"
});
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/checkout', (req, res) => {
    res.sendFile('checkout.html', { root: dirname })
})

app.get('/success', (req, res) => {
    res.sendFile('success.html', { root: dirname })
})

app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: '{{PRICE_ID}}',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });
  
    res.redirect(303, session.url);
  });
  
app.listen(port, () => {
    console.log('Example app listening at', port)
})
const webscraping = async (pageURL) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    let dataObj = {};
    try {
        await page.goto(pageURL);
        //work on this
        //use $i to iterate through tables
        let attributeList = [];
        const scrappedItems = await page.evaluate(() => {
            //what the hell is happening here
            keys = Array.from(document.querySelectorAll('#product-details > div.tab-panes > div:nth-child(2) > table tr th'));
            values = Array.from(document.querySelectorAll('#product-details > div.tab-panes > div:nth-child(2) > table tr td'));
            keys = keys.map(th => th.innerText);
            values = values.map(td => td.innerText);
            const merged = keys.reduce((obj, key, index) => ({ ...obj, [key]: values[index] }), {});
            return merged
        });

        dataObj = {
            scrappedItems
        }
    } catch (e) {
        console.log(e);
    }
    console.log(dataObj);
    browser.close();
    return dataObj;
};

let cpu = new Promise((res) => {
    res(webscraping(pageURL).catch(console.error));
    // prod_name, cores, socket, compatibility, mem_type
});
cpu.then((result) => {
    var values = [
        result.scrappedItems['Name '],
        result.scrappedItems['# of Cores # of Cores'],
        result.scrappedItems['CPU Socket Type CPU Socket Type'],
        result.scrappedItems['64-Bit Support 64-Bit Support'],
        result.scrappedItems['Memory Types ']];
    var sql = "INSERT INTO cpu (prod_name, cores, socket, compatibility, mem_type) VALUES (?)";
    con.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });
}).catch(err => console.log(err));