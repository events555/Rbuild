CREATE TABLE `aio_cooler` (
  `stock` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `price` varchar(255) NOT NULL,
  `intel_sock` varchar(255) NOT NULL,
  `amd_sock` varchar(255) NOT NULL,
  `pump_sp` varchar(255) NOT NULL,
  `rad_size` varchar(255) NOT NULL,
  `size` varchar(255) NOT NULL,
  `sys` varchar(255) NOT NULL,
  `sp` varchar(255) NOT NULL,
  `airflow` varchar(255) NOT NULL,
  `max_pres` varchar(255) NOT NULL,
  `noise_lvl` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci