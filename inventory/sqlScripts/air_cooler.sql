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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci