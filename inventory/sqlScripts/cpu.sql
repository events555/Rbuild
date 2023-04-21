CREATE TABLE `cpu` (
  `stock` int NOT NULL,
  `upc` varchar(255) NOT NULL,
  `prod_name` mediumtext NOT NULL,
  `price` varchar(255) NOT NULL,
  `cores` varchar(255) NOT NULL,
  `cpu_core` varchar(255) NOT NULL,
  `socket` varchar(255) NOT NULL,
  `compatibility` mediumtext NOT NULL,
  `lvl3` varchar(255) NOT NULL,
  `therm_power` varchar(255) NOT NULL,
  `processor` varchar(255) NOT NULL,
  `op_freq` varchar(255) NOT NULL,
  `turbo_sp` varchar(255) NOT NULL,
  `gfx_spec` varchar(255) NOT NULL,
  `mem_type` mediumtext NOT NULL,
  `pcie` varchar(255) NOT NULL,
  PRIMARY KEY (`upc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci