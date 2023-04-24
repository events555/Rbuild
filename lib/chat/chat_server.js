const app = require('../../server.js')
const server = require('http').createServer(app);
const socketio = require('socket.io');
const io = socketio(server, { cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}});
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
            if (err) {
                // Handle the error here
                console.error(err);
                return;
            }
            chatHistory = results;
            for (let i = 0; i < chatHistory.length; i++) {
                chatHistory[i] = JSON.stringify(chatHistory[i]);
                chatHistory[i] = chatHistory[i].substring(14, chatHistory[i].length-2);
                chat.to(socket.id).emit('chat-message', chatHistory[i]);
            }
        })
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
            let post = {line_text: data.msg, socket_id: socket.id};
            connection.query('INSERT INTO chat_line SET ?', [post], (err) => {
                if (err) throw err;
                else console.log(post);
            });
        } else { // send private message
            chat.to(room).emit('chat-message', data.msg);
        }
    });
});
server.listen(8000, () => {
    console.log('Chat server listening on Port 8000');
});
};  