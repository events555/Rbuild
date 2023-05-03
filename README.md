# OVERVIEW OF FOLDER HIERARCHY

Folders: inventory, lib, node_modules (might have issue with Bcrypt because some teammates are on Linux/Windows and the versions differ), and public

- inventory: contains all the needed MySQL tables (in the form of a .sql file) and also the .csv files needed to create the product inventory.  The name of the MySQL database is called rbuild and the username and password to the MySQL server is root and password is admin.  Please change the username and password to match what yours is if it is different.  Please also run all the .sql files (EXCEPT loadCSV.sql) in software like MySQL workbench to generate the databases.  You can then run the loadCSV.sql to load the .csv product databases into the prduct tables.  Be sure to edit the file depending on what database you want to load. **NOTE: You might have issues loading the .sql files into your MySQL server and get the error 3948 (42000) 'loading local data is disabled' please open mysql and run SET GLOBAL local_infile=true; and this should fix the error.**

- lib: contains Node.js endpoints (account.js, cart.js, inventory.js, review.js, and user.js) that are loaded and called by the server.js in the root of the Rbuild folder.  It also contains the folder chat which holds all the necessary files for running the chat server (chat.html, chat_server.js, and index.html).

- public: contains the assets folder (which stores various fonts, images, css, and javascript) and all the other important html files that can be accessed by going to http://localhost:3000.  Contains the following pages.

  -  add_product_manage.html: iframe for product_manage.html that allows admins to edit/delete/add to the product inventory. 
  -  index.html: Main website homepage.  When you run the server.js with node and you go to http://localhost:3000 this is the page that is loaded.  From here you can navigate to all other pages.
  -  login-register.html: Main login and register page
  -  man_build.html: The pcpartpicker-like compatibility checker list for registered users.  Users can add parts to their list by pressing the purple choose button and an iframe shop_popout will be loade.  They can then clear their list or purchase all items in the list.
  -  product_detail.html: Product page for the shop showing product information.
  -  product_manage.html: Main page for admins to edit/delete/add to the product inventory.
  -  purchase_manage.html: Main page that allows customers to view their purchases, request return/replacements, and edit/add/delete reviews.
  -  purchase_manage_2.html: iframe for purchase_manage.html that allows customers to request returm/replacement or edit/add/delete reviews.
  -  request_form.html: The main form which allows registered users to request a PC to be build for them from company employees.  Links customers with a builder where they can then chat to them.
  -  shop_popout.html: iframe for man_build that allows products to be searched for and added to their manual builder list.
  -  thank_you.html: feedback page that is loaded when request_form.html is submitted and when logging in.
  -  user-manage.html: Admin page that allows users to be deleted or their roles to be changed.

# RUNNING THE PROGRAM

Make sure to have node installed, the required modules, and a MySQL server setup with the rbuild database (the username used here is root and password is admin but you should be able to change this in server.js file in the root directory: where the //connect this node.js server to the mysql comment is).  After that, run the .sql files in the inventory directory (besides loadCSV.sql) and then load all the product .csvs into their respective table (make sure local_infile is set to true).  You can then run node server.js and open the browser to http://localhost:3000 to view the page.
