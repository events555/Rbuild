# Rbuild

Folders: chat, icons, manual_builds, request, server, and shop

- [IGNORE THIS FOLDER AS LANCE IS WORKING ON THIS; I JUST WANTED TO SEE IF I COULD GET SOMETHING TO WORK] chat: contains the chat_client.html frontend for a customer to chat with company builder.  Currently a work in progress.  Run the chat_server.js in order to start the listener.  I am having issues getting the chat clients and server to connect.  I think it is a CORS issue which I will have to fix in the chat_server.js file.
- icons: contains the main company logo and also the simplified website icon to appear in the browser tab.
- manual_builds: contains the man_build html page which is where the user can create their own PC build themselves.  Pressing a "Choose [part]" button brings out an iframe that has the shop_popout.html file which will be connected to the main database. (TO DO).  Pressing "add to cart" for any item on the shop_popout will update the main man_build.html page with the item and the price.  This folder also contains the login_register.html which is done.  The login_register.html will be loaded with the man_build and request_form.html (TO DO).  You need to be running an http server (like apache) in order for this page to be able to work and store cookies.  You can ignore shop_ex.html that was for testing.
- request: contains the request_form.html.  It is not fully done yet: I want to add some more stuff to the page and I need to connect it with our database.  thank_you.html is loaded when the user submits the form.
- server: contains the chat_server.js (which you can ignore) and the main server.js which allows the html code to interact with our database.  Run this code if you are testing the login process.
- shop: contains html files for the template for the overall website.  Needs a lot of work and modification to fit our needs.


***IMPORTANT INFORMATION***

To test the code (mostly the login/register process), you need the following:

- A MySQL database running on localhost with the username root, password admin, and database rbuild.  The rbuild database should have a table named users with the following columns: userid, username, password, and role.  Here is the create table: 

CREATE TABLE `users` (
  `userid` int NOT NULL AUTO_INCREMENT,
  `username` varchar(15) NOT NULL,
  `password` varchar(72) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'Customer',
  PRIMARY KEY (`userid`)
)

- npm and Node.js installed with the following packages (express, body-parser, cors, mysql, cookie-parser, and crypto).

- An apache http server with the login_register.html file in it.  
