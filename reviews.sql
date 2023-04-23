
DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `reviewid` int NOT NULL AUTO_INCREMENT,
  `userid` int DEFAULT NULL,
  `username` varchar(15) NOT NULL,
  `upc` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `comment` mediumtext NOT NULL,
  `updateTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `isDeleted` int DEFAULT '0',
  `reply` text,
  `deleteReason` varchar(255) DEFAULT NULL,
  `reply_user_id` varchar(255) DEFAULT NULL,
  `delete_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`reviewid`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;