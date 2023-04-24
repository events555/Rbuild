# Chat for Build Requests
### (Lance's Code with front-end implemented)
## Needed Installations:
Using Node.js and have the following installed: nodemon, socket.io, express, mysql2

To install in directory, run these commands in the terminal:
1. `npm i nodemon`
2. `npm i socket.io`
3. `npm i express`
4. `npm i mysql2`

## Included Files:
* `index.html`: HTML file with hyperlink references that go to builder or customer view. Front-end implemented by Brian.
* `customer.html` / `builder.html`: Asks user to enter their name and then enters the chat room interface. Front-end implemented by Brian
* `chat.html`: Uses socket.io accompanied with event listeners to transmit messages back and forth between the chat window. Front-end implemented by Brian
* `server.js`: Backend of the chat window. Currently uses socket.io and express to send messages/notify of connections and disconnections in the chat window.
* `server(sqlconnected).js`: SQL connected server.js file (not used for this, but used in overall project to connect to user database)
* `public`: folder that contains CSS contents and images

## Run Chat Application:
1. Go to the "Needed Installations" section of this file and run the listed commands.
1. Type `npm run devStart` into the terminal/console of text editor to run `nodemon` so that it is constantly running the server.
2. The port is currently set to `3000` so go into any browser and type `http://localhost:3000`
3. To test customer interface: localhost:3000 should ask you to choose a role. Choose "Customer", enter a name, and then press "Enter Chat Room"
4. To test builder interface: localhost:3000 should ask you to choose a role. Choose "Builder", enter a name (one word), and then press "Enter Chat Room"