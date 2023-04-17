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
  `rand_w_4k` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci