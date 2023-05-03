# Rbuild

Folders: inventory, lib, node_modules (might have issue with Bcrypt because some teammates are on Linux/Windows and the versions differ), and public

- inventory: contains all the needed MySQL tables (in the form of a .sql file) and also the .csv files needed to create the product inventory.  The name of the MySQL database is called rbuild and the username and password to the MySQL server is root and password is admin.  Please change the username and password to match what yours is if it is different.  Please also run all the .sql files (EXCEPT loadCSV.sql) in software like MySQL workbench to generate the databases.  You can then run the loadCSV.sql to load the .csv product databases into the prduct tables.  Be sure to edit the file depending on what database you want to load. 

- 

- chat: refer to Lance's branch for more info on how the chat works; all I did was change the port to 3001 so the server.js can run with the chat_server.js
- employee: contains admin user database management(frontend to change user's roles & delete users from the database). You must be running an http server (like apache) and you must have a user in the database with the username 'admin' and role 'Admin'. If you do not have an 'admin' user in your user database, uou can first run the login_register.html in the manual_builds folder to register admin.
- icons: company logo (large and small versions)
- inventory: contains the .csv files with the product data. Also there should be a loadCSV.sql file which will help you load in the file into the databases. Be sure to change the directory and you might have issues loading the files in b/c certain settings are not enabled. You can just put it in your MySQL data folder if you have trouble.
- manual_builds: contains the man_build html page which is where the user can create their own PC build themselves. Pressing a "Choose [part]" button brings out an iframe that has the shop_popout.html file which will be connected to the main database. (TO DO). Pressing "add to cart" for any item on the shop_popout will update the main man_build.html page with the item and the price. This folder also contains the login_register.html which is done. The login_register.html will be loaded with the man_build and request_form.html (TO DO). You need to be running an http server (like apache) in order for this page to be able to work and store cookies. You can ignore shop_ex.html that was for testing.
- request: contains the request_form.html. It is not fully done yet: I want to add some more stuff to the page and I need to connect it with our database. thank_you.html is loaded when the user submits the form.
- server: contains the chat_server.js (which you can ignore) and the main server.js which allows the html code to interact with our database. Run this code if you are testing the login process.
- shop: contains html files for the template for the overall website. Needs a lot of work and modification to fit our needs.

**_IMPORTANT INFORMATION_**

To test the code (mostly the login/register process), you need the following:

- A MySQL database running on localhost with the username root, password admin, and database rbuild. The rbuild database should have a table named users with the following columns: userid, username, password, and role. Here is the create table:

CREATE TABLE `users` (
`userid` int NOT NULL AUTO_INCREMENT,
`username` varchar(15) NOT NULL,
`password` varchar(72) NOT NULL,
`role` varchar(50) NOT NULL DEFAULT 'Customer',
PRIMARY KEY (`userid`)
)

- npm and Node.js installed with the following packages (express, body-parser, cors, mysql, cookie-parser, and crypto).

- An apache http server with the login_register.html file in it.

Run the MySQL files in /inventory/sqlScripts to create the required MySQL tables in software like MySQL Workbench.

To populate the product database with the info from the inventory .csv tables, run the loadCSV.sql file included in the inventory folder or just put it in your MySQL data folder.
