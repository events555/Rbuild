# Chat for Build Requests

Updated 4/17: Chat history implementation is complete. Final task to run is setting up with the user database to create separate rooms.
Possible front end implementation:
* Updating user status whether or not they are in the chat room
* Modifying the timestamp on chat history messages (currently sets it as time upon entering room).

I am using Node.js for this and have the following installed: nodemon, socket.io, express, mysql

Files that are included:
* index.html: Just a generic html file with hyperlink references that go to builder or customer view but this
  front end is mainly going to be implemented by Brian.
* customer.html/builder.html: Currently working on using cookies or some sort of data pass so that I can get the
  chat to display builder/customer next to their current message. Will probably implement this later on for Demo 2 with Ryan's
  login code and use the account names that are associated with each user next to the message names. For now, just to display
  working chat functionality, will only say builder or customer next to the message. This will most likely be implemented by Brian.
* chat.html: Client side of the chat box. Currently uses socket.io accompanied with event listeners to transmit messages back and
  forth between the chat window. 
* server.js: Backend of the chat window. Currently uses socket.io and express to send messages/notify of connections and disconnections in
  the chat window.

To run:
* Type "npm run devStart" into the console to run nodemon so that it is constantly running the server.
* The port is currently set to 3000 so you go into Chrome/Firefox/Browser and type http://localhost:3000
* To test customer vs builder open up two different instances of your browser
* Need to create a MYSQL database with the following

CREATE SCHEMA rbuilds

CREATE TABLE rbuild.chat_line
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    line_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(ID)
