const app = require("../../server.js");
const server = require("http").createServer(app);
const socketio = require("socket.io");
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
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
  });

  // passing builder chat to site
  app.get("/builder/chat", (req, res) => {
    res.sendFile(__dirname + "/chat.html");
  });

  const chat = io.of("/chat");
  chat.on("connection", (socket) => {
    // notifies when a user has connected and emits chat history
    socket.on("join", (room) => {
      socket.join(room);
      setTimeout(() => {
        chat.emit("chat-message", "User has entered the room");
      }, 50);
    });

    // notifies when a user has disconnected
    socket.on("disconnect", () => {
      chat.emit("chat-message", "User has left the room");
    });

    // sends user messages
    socket.on("chat-message", (data, currentRoom, sendRoom, role) => {
      console.log("current Room: " + currentRoom + " sends to: " + sendRoom);
      // append to end of the chat message history (if exists)
      let post;
      if (role === "Builder") {
        // first check if entry exists in the table, otherwise
        post = {
          line_text: data.msg,
          customer: currentRoom,
          employee: sendRoom,
        };
        //connection.query('INSERT INTO chat_line')
      }

      if (role === "Customer") {
        post = {
          line_text: data.msg,
          employee: currentRoom,
          customer: sendRoom,
        };
      }

      chat.to(sendRoom).emit("chat-message", data.msg);
    });
  });
  server.listen(8000, () => {
    console.log("Chat server listening on Port 8000");
  });
};
