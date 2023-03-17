// (A) INIT + CREATE HTTP SERVER AT PORT 5050
var http = require ('http');
var server = http.createServer (function (request, response) {
  console.log ((new Date ()) + ' Received request for ' + request.url);
  response.writeHead (404);
  response.end ();
});
server.listen (5050, function () {
  console.log ((new Date ()) + ' Server is listening on port 5050');
});

// (B) INIT + CREATE SOCKET.IO SERVER
var io = require ('socket.io') (server);

// (C) ON CLIENT CONNECT
io.on ('connection', function (socket) {
  // (C1) GET THE CHAT INSTANCE ID FROM THE QUERY STRING
  var chatId = socket.handshake.query.chatId;

  // (C2) JOIN THE CHAT INSTANCE NAMESPACE AND ROOM
  var nsp = io.of ('/' + chatId); // create or get the namespace
  socket.join (chatId); // join the room with the same name as the chatId

  // (C3) FORWARD MESSAGE TO ALL IN THE SAME ROOM ON RECEIVING MESSAGE
  socket.on ('message', function (msg) {
    nsp.to(chatId).emit('message', msg); // emit message to all in the room
    console.log('Received Message: ' + msg);
  });

  // (C4) LEAVE THE ROOM ON DISCONNECT
  socket.on ('disconnect', function () {
    socket.leave(chatId); // leave the room
    console.log((new Date ()) + ' Peer ' + socket.id + ' disconnected.');
  });
});
