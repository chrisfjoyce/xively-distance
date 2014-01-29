CREATE DATABASE IF NOT EXISTS xively_iostp;
USE xively_iostp;

CREATE TABLE IF NOT EXISTS permalinks(
   code VARCHAR(30) PRIMARY KEY,
   observation_kit_json TEXT NOT NULL,
   creation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE USER 'xively_iostp'@'localhost' IDENTIFIED BY 'x1v3ly_i0stp';
GRANT ALL PRIVILEGES ON xively_iostp.* TO 'xively_iostp'@'localhost';