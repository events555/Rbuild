# Rbuild

Folders: chat, icons, manual_builds, request, server, and shop

- chat: refer to Lance's branch for more info on how the chat works; all I did was change the port to 3001 so the server.js can run with the chat_server.js
employee: contains admin user database management(frontend to change user's roles & delete users from the database).  You must be running an http server (like apache) and you must have a user in the database with the username 'admin' and role 'Admin'.  If you do not have an 'admin' user in your user database, uou can first run the login_register.html in the manual_builds folder to register admin.
- inventory: contains the .csv files with the product data.  Also there should be a loadCSV.sql file which will help you load in the file into the databases.  Be sure to change the directory and you might have issues loading the files in b/c certain settings are not enabled.  You can just put it in your MySQL data folder if you have trouble.
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

**Some other tables you will need in your database and their create tables...**

aio_cooler: 

CREATE TABLE `aio_cooler` (
  `stock` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `price` varchar(255) NOT NULL,
  `intel_sock` varchar(255) NOT NULL,
  `amd_sock` varchar(255) NOT NULL,
  `pump_sp` varchar(255) NOT NULL,
  `rad_size` varchar(255) NOT NULL,
  `size` varchar(255) NOT NULL,
  `sys` varchar(255) NOT NULL,
  `sp` varchar(255) NOT NULL,
  `airflow` varchar(255) NOT NULL,
  `max_pres` varchar(255) NOT NULL,
  `noise_lvl` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
)

air_cooler:

CREATE TABLE `air_cooler` (
  `stock` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `price` varchar(255) NOT NULL,
  `intel_sock` varchar(255) NOT NULL,
  `amd_sock` varchar(255) NOT NULL,
  `heat_pipes` int NOT NULL,
  `fans` varchar(255) NOT NULL,
  `fan_sp` varchar(255) NOT NULL,
  `airflow` varchar(255) NOT NULL,
  `max_air_pres` varchar(255) NOT NULL,
  `noise_lvl` varchar(255) NOT NULL,
  `height` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
)

cases:

CREATE TABLE `cases` (
  `stock` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `price` varchar(255) NOT NULL,
  `max_mobo` varchar(255) NOT NULL,
  `mobo_sup` varchar(255) NOT NULL,
  `num_35_bay` int NOT NULL,
  `num_25_bay` int NOT NULL,
  `sup_rad` varchar(255) NOT NULL,
  `int_rad` varchar(255) NOT NULL,
  `fan_bay` varchar(255) NOT NULL,
  `inc_fan` varchar(255) NOT NULL,
  `pow_sup` varchar(255) NOT NULL,
  `pow_watt` varchar(255) NOT NULL,
  `pow_mount` varchar(255) NOT NULL,
  `max_heatsink` varchar(255) NOT NULL,
  `max_psu` varchar(255) NOT NULL,
  `max_gpu` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
)

cpu:

CREATE TABLE `cpu` (
  `stock` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `price` varchar(255) NOT NULL,
  `cores` varchar(255) NOT NULL,
  `cpu_core` varchar(255) NOT NULL,
  `socket` varchar(255) NOT NULL,
  `compatibility` mediumtext NOT NULL,
  `lvl3` varchar(255) NOT NULL,
  `therm_power` varchar(255) NOT NULL,
  `processor` varchar(255) NOT NULL,
  `op_freq` varchar(255) NOT NULL,
  `turbo_sp` varchar(255) NOT NULL,
  `gfx_spec` varchar(255) NOT NULL,
  `mem_type` mediumtext NOT NULL,
  `pcie` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
)

gpu:

CREATE TABLE `gpu` (
  `stock` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `price` varchar(255) NOT NULL,
  `gpu_man` varchar(255) NOT NULL,
  `gpu_chip` varchar(255) NOT NULL,
  `boost_clock` varchar(255) NOT NULL,
  `vid_mem` varchar(255) NOT NULL,
  `pow_con` varchar(255) NOT NULL,
  `rec_psu` varchar(255) NOT NULL,
  `card_length` varchar(255) NOT NULL,
  `hdmi` varchar(255) NOT NULL,
  `display_port` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
)

memory:

CREATE TABLE `memory` (
  `stock` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `price` varchar(255) NOT NULL,
  `mem_type` varchar(255) NOT NULL,
  `pin_config` varchar(255) NOT NULL,
  `mem_speed` varchar(255) NOT NULL,
  `mem_cap` varchar(255) NOT NULL,
  `mem_pfp` varchar(255) NOT NULL,
  `modules` int NOT NULL,
  `volt` varchar(255) NOT NULL,
  `cas_lat` varchar(255) NOT NULL,
  `lat_time` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
)

mobo:

CREATE TABLE `mobo` (
  `stock` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `price` varchar(255) NOT NULL,
  `chipset` varchar(255) NOT NULL,
  `socket` varchar(255) NOT NULL,
  `mem_type` mediumtext NOT NULL,
  `mem_speeds` mediumtext NOT NULL,
  `mem_slots` varchar(255) NOT NULL,
  `max_mem` varchar(255) NOT NULL,
  `max_mem_slot` varchar(255) NOT NULL,
  `ssd_slots` varchar(255) NOT NULL,
  `sata_slots` varchar(255) NOT NULL,
  `wifi` varchar(255) NOT NULL,
  `pcie_4` varchar(255) NOT NULL,
  `pcie_3` varchar(255) NOT NULL,
  `pcie_5` varchar(255) NOT NULL,
  `form_fact` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
)

psu:

CREATE TABLE `psu` (
  `stock` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `price` varchar(255) NOT NULL,
  `watt` varchar(255) NOT NULL,
  `form_factor` varchar(255) NOT NULL,
  `modular` varchar(255) NOT NULL,
  `atx_con` varchar(255) NOT NULL,
  `atx_12_con` varchar(255) NOT NULL,
  `gfx_con` varchar(255) NOT NULL,
  `molex_con` varchar(255) NOT NULL,
  `sata_con` varchar(255) NOT NULL,
  `rating` varchar(255) NOT NULL,
  `psu_size` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
)

reviews:

CREATE TABLE `reviews` (
  `reviewid` int NOT NULL AUTO_INCREMENT,
  `userid` int NOT NULL,
  `username` varchar(15) NOT NULL,
  `upc` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `comment` mediumtext NOT NULL,
  PRIMARY KEY (`reviewid`,`userid`)
)

storage:

CREATE TABLE `storage` (
  `stock` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `price` varchar(255) NOT NULL,
  `capacity` varchar(255) NOT NULL,
  `cache` varchar(255) NOT NULL,
  `rpm` varchar(255) NOT NULL,
  `endur` varchar(255) NOT NULL,
  `read_sp` varchar(255) NOT NULL,
  `write_sp` varchar(255) NOT NULL,
  `interface` varchar(255) NOT NULL,
  `form_factor` varchar(255) NOT NULL,
  `rand_r_4k` varchar(255) NOT NULL,
  `rank_w_4k` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
)

transactions:

CREATE TABLE `transactions` (
  `transid` int NOT NULL AUTO_INCREMENT,
  `userid` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `quantity` int NOT NULL,
  `price` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `status` varchar(255) NOT NULL,
  PRIMARY KEY (`transid`,`userid`)
)

To populate the product database with the info from the inventory .csv tables, run the loadCSV.sql file included in the inventory folder or just put it in your MySQL data folder.
