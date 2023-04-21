CREATE TABLE `pendingService` (
  `serviceid` int NOT NULL AUTO_INCREMENT,
  `employee` varchar(15) NOT NULL,
  `customer` varchar(15) NOT NULL,
  `request` varchar(45) NOT NULL,
  `date` date NOT NULL,
  `data` longtext NOT NULL,
  PRIMARY KEY (`serviceid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci