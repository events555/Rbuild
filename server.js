const express = require("express");
const mysql = require("mysql");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const port = 3000;
const uuidv4 = require("uuid").v4;
const inventory = require("./lib/inventory");
const review = require("./lib/review");
const account = require("./lib/account");
const chat_server = require("./lib/chat/chat_server");
const user = require("./lib/user");
const cart = require("./lib/cart");

//connect this node.js server to the mysql server...
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "admin",
  database: "rbuild",
});

connection.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(crypto.randomBytes(64).toString()));
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost" }));
app.use(
  express.static("public", {
    setHeaders: (res, path) => {
      // import mime-types package
      const mime = require("mime-types");
      const type = mime.lookup(path);
      // explicitly set the Content-Type header for each response
      res.setHeader("Content-Type", type);
    },
  })
);

app.use(
  "/socket.io",
  express.static(__dirname + "/node_modules/socket.io/client-dist")
);

inventory(app, connection);
review(app, connection);
account(app, connection);
chat_server(app, connection);
user(app, connection);
cart(app, connection);

app.use((req, res, next) => {
  // check if the user already has a UUID
  let userid = req.cookies.userId;
  if (!userid) {
    // generate a new UUID for the user
    userid = uuidv4();
    // set the userId cookie
    res.cookie("userId", userid);
  }
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;
