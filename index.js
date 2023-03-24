const express = require('express');
const puppeteer = require('puppeteer');
const app = express()
app.use(express.static('public'));
const port = 3000
const stripe = require('stripe')('sk_test_51MiU4xLGe3DYUFyZAHJjWk6FWztmtnjTwjNvzEGQpZCWqyqDbe5Lr3Iag442Nu0mzdEwiRvYFjw5vVhCFfFPG55M00DXkYvohM')
const pageURL =
    'https://www.newegg.com/intel-core-i5-12600k-core-i5-12th-gen/p/N82E16819118347?Description=processors&cm_re=processors-_-19-118-347-_-Product';

var mysql = require('mysql');
const YOUR_DOMAIN = 'http://localhost:3000';

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "parts"
});

var values = []
var sql = ""
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

app.get('/', (req, res) => {
    res.sendFile('public/home.html', { root: __dirname })
})

app.get('/checkout', (req, res) => {
    res.sendFile('public/checkout.html', { root: __dirname })
})

app.get('/success', (req, res) => {
    res.sendFile('public/success.html', { root: __dirname })
})

app.post('/insert-item', (req, res) => {
    console.log(sql);
    con.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });
    res.redirect(303,YOUR_DOMAIN+'/'); 
})

app.post('/create-checkout-session', async(req, res) => {
    const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: 'price_1Mp0n0LGe3DYUFyZsf1jnQNW',
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/success.html`,
        cancel_url: `${YOUR_DOMAIN}/`,
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
        //let attributeList = [];
        const scrappedItems = await page.evaluate(() => {
            //getting tables
            let keys = Array.from(document.querySelectorAll('#product-details > div.tab-panes > div:nth-child(2) > table tr th'));
            let values = Array.from(document.querySelectorAll('#product-details > div.tab-panes > div:nth-child(2) > table tr td'));
            keys = keys.map(th => th.innerText.trim());
            values = values.map(td => td.innerText.trim());
            keys = keys.map(x => Array.from(new Set(x.split(' '))).toString().split(',').join(' '));
            //values = values.map(x => Array.from(new Set(x.split(' '))).toString().split(',').join(' '));
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
    values = [
        result.scrappedItems['Name'],
        result.scrappedItems['# of Cores'],
        result.scrappedItems['CPU Socket Type'],
        result.scrappedItems['64-Bit Support'],
        result.scrappedItems['Memory Types']];
    sql = "INSERT INTO cpu (prod_name, cores, socket, compatibility, mem_type) VALUES (?)";
    con.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });
}).catch(err => console.log(err));