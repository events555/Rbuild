LOAD DATA LOCAL INFILE '/Users/03ste/Downloads/Rbuild-rtm121-inprogress/inventory/sqlScripts/mobo.csv' INTO TABLE mobo
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;