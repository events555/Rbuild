const express = require('express');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const port = 3000;


const inventory = require('./lib/inventory');
const review = require('./lib/review');
const account = require('./lib/account');
const chat_server = require('./lib/chat/chat_server');
const user = require('./lib/user');


//connect this node.js server to the mysql server...
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin',
    database: 'rbuild'
});

connection.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(crypto.randomBytes(64).toString()));
app.use(express.json());
app.use(cors({credentials: true, origin: 'http://localhost'}));
app.use(express.static('shop'));


inventory(app, connection);
review(app, connection);
account(app, connection);
chat_server(app);
user(app, connection);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop','index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});