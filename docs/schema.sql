CREATE DATABASE IF NOT EXISTS pet_adoption;
USE pet_adoption;

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL, -- 'ADMIN' or 'ADOPTER'
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pets (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  type         VARCHAR(50)  NOT NULL, -- 'DOG', 'CAT', 'OTHER'
  breed        VARCHAR(255),
  age_years    INT,
  description  TEXT,
  status       VARCHAR(20) NOT NULL,  -- 'AVAILABLE', 'PENDING', 'ADOPTED'
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adoption_requests (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  pet_id        BIGINT NOT NULL,
  adopter_id    BIGINT NOT NULL,
  message       TEXT,
  status        VARCHAR(20) NOT NULL, -- 'PENDING', 'APPROVED', 'REJECTED'
  requested_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at  TIMESTAMP NULL,
  CONSTRAINT fk_pet FOREIGN KEY (pet_id) REFERENCES pets(id),
  CONSTRAINT fk_adopter FOREIGN KEY (adopter_id) REFERENCES users(id)
);
