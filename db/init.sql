CREATE DATABASE IF NOT EXISTS sre_login;
USE sre_login;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(190) NOT NULL
);

CREATE TABLE IF NOT EXISTS tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  token TEXT NOT NULL
);


-- default user for testing
INSERT IGNORE INTO users (email, password)
VALUES ('shalev@gmail.com', '123');
