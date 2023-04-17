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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci