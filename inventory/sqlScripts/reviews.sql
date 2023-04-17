CREATE TABLE `reviews` (
  `reviewid` int NOT NULL AUTO_INCREMENT,
  `userid` int NOT NULL,
  `username` varchar(15) NOT NULL,
  `upc` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `comment` mediumtext NOT NULL,
  PRIMARY KEY (`reviewid`,`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci