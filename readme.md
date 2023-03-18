# Chat for Build Requests

I am using Node.js for this and have the following installed:
* nodemon: Mainly for testing, am using this to just keep the server running so I don't have to type "node server.js" every time.
* socket.io and express: Works together but they are used as the i/o for our chat functionality.
* mysql: Will be implemented later but is going to work with the user database to display usernames in the chat box.

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

WIP for Demo 1:
* customer.html and builder.html need to pass data so that I can have it display builder and customer next to the message names. Server.js
  and chat.html needs to be updated as well to accompany this.
* Adding the saving of chat history.
* Ability to modify messages.

WIP for Demo 2:
* Integrating this with the user database so that it can display specific user names.
* Making the chat room look overall cleaner.
  * Displaying who is currently online in the room.
  * Tidying up the looks of the chat room to make it look better.

To run:
* Type "npm run devStart" into the console to run nodemon so that it is constantly running the server.
* The port is currently set to 3000 so you go into Chrome/Firefox/Browser and type http://localhost:3000
