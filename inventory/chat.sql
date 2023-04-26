CREATE TABLE `chat_line` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user1` varchar(15) NOT NULL,
  `user2` varchar(15) NOT NULL,
  `line_text` text,
  `line_time` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci