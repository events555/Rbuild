const express = require("express");
const app = express();
const http = require("http");
const mysql = require("mysql");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// passing general index.html file to website
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// passing customer chat to site
app.get("/customer/chat", (req, res) => {
    res.sendFile(__dirname + "/chat.html");
});

// passing customer tab to site
app.get("/customer", (req, res) => {
    res.sendFile(__dirname + "/customer.html");
});

// passing builder tab to site
app.get("/builder", (req, res) => {
    res.sendFile(__dirname + "/builder.html");
})

// passing builder chat to site
app.get("/builder/chat", (req, res) => {
    res.sendFile(__dirname + "/chat.html");
});

const chat = io.of("/chat");
chat.on("connection", (socket) => {
    // notifies when a user has connected
    socket.on("join", (data) => {
        socket.join(data.room);
        chat.in(data.room).emit("chat-message", "User has entered the room");
    });

    // notifies when a user has disconnected
    socket.on("disconnect", () => {
        chat.emit("chat-message", "User has left the room");
    });

    // sends user messages
    socket.on("chat-message", (data) => {
        chat.in(data.room).emit("chat-message", data.msg);
    });
});

// added code to access .css file (ensures that the browser can interpret the CSS file and apply styles to HTML)
// import built-in path module
const path = require('path');
// set up middleware to handle static files from public directory (css, image files)
app.use(express.static('assets', {
setHeaders: (res, path) => {
    // import mime-types package
    const mime = require('mime-types');
    const type = mime.lookup(path);
    // explicitly set the Content-Type header for each response 
    res.setHeader('Content-Type', type);
}
}));

server.listen(3001, () => {
    console.log("listening on Port 3001");
});


