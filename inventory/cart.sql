DROP TABLE IF EXISTS `cart`;

CREATE TABLE `cart` (
    `prod_name` mediumtext NOT NULL,
    `upc` varchar(255) NOT NULL,
    `price` varchar(255) NOT NULL,
    `quantity` int NOT NULL,
    `userid` CHAR(36) NOT NULL,
    PRIMARY KEY (`upc`)
    )