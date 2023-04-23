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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci