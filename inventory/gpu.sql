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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci