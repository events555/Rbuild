const express = require('express');
const app = express();
const mysql = require('mysql2');
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server, { cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}});

// connecting to the mysql server
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin',
    database: 'rbuilds'
});
connection.connect();

// passing general index.html file to website
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// passing customer chat to site
app.get('/customer/chat', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

// passing customer tab to site
app.get('/customer', (req, res) => {
    res.sendFile(__dirname + '/customer.html');
});

// passing builder tab to site
app.get('/builder', (req, res) => {
    res.sendFile(__dirname + '/builder.html');
})

// passing builder chat to site
app.get('/builder/chat', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

const chat = io.of('/chat');
chat.on('connection', (socket) => {
    
    // notifies when a user has connected and emits chat history
    socket.on('join', room => {
        socket.join(room);
        let chatHistory = [];
        connection.connect(function(err) {
            if (err) throw err; 
            console.log('Connected!');
            let sql = 'SELECT line_text FROM rbuilds.chat_line';
            connection.query(sql, (err, results) => {
                if (err) throw err;
                chatHistory = results;
                for (let i = 0; i < chatHistory.length; i++) {
                    chatHistory[i] = JSON.stringify(chatHistory[i]);
                    chatHistory[i] = chatHistory[i].substring(14, chatHistory[i].length-2);
                    chat.to(socket.id).emit('chat-message', chatHistory[i]);
                }
            })
        });
        setTimeout(() => {
            chat.emit('chat-message', 'User has entered the room with id: ' + socket.id);
        }, 50);
    });

    // notifies when a user has disconnected
    socket.on('disconnect', () => {
        chat.emit('chat-message', 'User has left the room with id: ' + socket.id);
    });

    // sends user messages
    socket.on('chat-message', (data, room) => {
        if (room == '') { // if not private messaging, send publicly
            chat.emit('chat-message', data.msg);
            connection.connect(function(err) {
                if (err) throw err;
                console.log('Connected!');
                let post = {line_text: data.msg};
                let sql = 'INSERT INTO chat_line SET ?';
                connection.query(sql, post, () => {
                    if (err) throw err;
                    console.log(post);
                });
            });
        } else { // send private message
            chat.to(room).emit('chat-message', data.msg);
        }
    });
});

// added code to access .css file (ensures that the browser can interpret the CSS file and apply styles to HTML)
// import built-in path module
const path = require('path');
// set up middleware to handle static files from public directory (css, image files)
app.use(express.static('public', {
setHeaders: (res, path) => {
    // import mime-types package
    const mime = require('mime-types');
    const type = mime.lookup(path);
    // explicitly set the Content-Type header for each response 
    res.setHeader('Content-Type', type);
}
}));

server.listen(3000, () => {
    console.log('listening on Port 3000');
});