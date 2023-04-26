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
    socket.on('join', (room, otherRoom, data, time) => { 
        socket.join(room);
        setTimeout(() => {
            chat.emit('chat-message', 'User has entered the room');
        }, 50);

        // now show all of the history if it exists
        connection.query("SELECT line_text, line_time FROM chat_line WHERE user1 = ? AND user2 = ?", [room, otherRoom], function(err, result)
        {
            if(err) throw err;

            if(result.length > 0)
            {
                var messages = result[0].line_text.split("\n");
                var times = result[0].line_time.split("\n");
                
                for(var i=0; i<messages.length-1; i++) {
                    chat.to(room).emit('chat-message', messages[i], times[i]);
                }
            }

            else
            {
                let checks = JSON.parse(data);
                if(checks.role === 'builder')
                {
                    connection.query("INSERT INTO chat_line (user1, user2, line_text) VALUES (?, ?, ?)", [room, otherRoom, '[Builder] You to ' + otherRoom + ": " + checks.message + "\n"], function(err, result) {
                        if (err) throw err;
                    chat.to(room).emit('chat-message', '[Builder] You to ' + otherRoom + ": " + checks.message);
                    });

                    connection.query("INSERT INTO chat_line (user1, user2, line_text) VALUES (?, ?, ?)", [otherRoom, room, '[Builder] ' + room + ": " + checks.message + "\n"], function(err, result) {
                        if (err) throw err;
                    chat.to(otherRoom).emit('chat-message', '[Builder] ' + checks.name + ": " + checks.message, time);
                    });
                }
            }
        });
    });

    // notifies when a user has disconnected
    socket.on('disconnect', () => {
        chat.emit('chat-message', 'User has left the room');
    });

    // sends user messages
    socket.on('chat-message', (data, currentRoom, sendRoom, time) => {
        //console.log('current Room: ' + currentRoom + ' sends to: ' + sendRoom);
        // append to end of the chat message history (if exists)
        connection.query("SELECT * FROM chat_line WHERE user1 = ? AND user2 = ?", [currentRoom, sendRoom], function(err, result) {
            if (err) throw err;
            // If no matching row, insert a new one
            if (result.length == 0) {
                connection.query("INSERT INTO chat_line (user1, user2, line_text, line_time), line_time = CONCAT(line_time, ?) WHERE VALUES (?, ?, ?, ?)", [currentRoom, sendRoom, data.msg, time+"\n"], function(err, result) {
                if (err) throw err;
                //console.log("Inserted new row");
                });
            }
            // If matching row, update it
            else {
                connection.query("UPDATE chat_line SET line_text = CONCAT(line_text, ?), line_time = CONCAT(line_time, ?) WHERE user1 = ? AND user2 = ?", [data.msg, time+"\n", currentRoom, sendRoom], function(err, result) {
                if (err) throw err;
                //console.log("Updated existing row");
                });
            }
            });              
            
        chat.to(sendRoom).emit('chat-message', data.msg, time);
    });
});
server.listen(8000, () => {
    console.log('Chat server listening on Port 8000');
});
};  