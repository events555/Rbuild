const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
module.exports = function (app, connection) {

// passing general index.html file to website
app.get("/chat", (req, res) => {
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

const chat = io.of('/chat');
chat.on('connection', (socket) => {
    
    // notifies when a user has connected and emits chat history
    socket.on('join', room => {
        socket.join(room);
        let chatHistory = [];
        connection.query('SELECT line_text FROM chat_line', (err, results) => {
            if (err) throw err;
            else {
                chatHistory = results;
                for (let i = 0; i < chatHistory.length; i++) {
                    chatHistory[i] = JSON.stringify(chatHistory[i]);
                    chatHistory[i] = chatHistory[i].substring(14, chatHistory[i].length-2);
                    chat.to(socket.id).emit('chat-message', chatHistory[i]);
                }
            }
        })
        });
    if (err) {
        // Database error
        res.status(500).send({ loggedIn: "failure" });
        return;
    }
        setTimeout(() => {
            chat.emit('chat-message', 'User has entered the room with id: ' + socket.id);
        }, 50);

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
                let post = {line_text: data.msg, socket_id: socket.id};
                let sql = 'INSERT INTO chat_line SET ?';
                connection.query(sql, post, () => {
                    if (err) throw err;
                    else console.log(post);
                });
            });
        } else { // send private message
            chat.to(room).emit('chat-message', data.msg);
        }
    });
});
};