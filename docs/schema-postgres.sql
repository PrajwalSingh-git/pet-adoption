
CREATE DATABASE pet_adoption;
\c pet_adoption;

CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pets (
  id           BIGSERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  type         VARCHAR(50)  NOT NULL,
  breed        VARCHAR(255),
  age_years    INT,
  description  TEXT,
  image_path   VARCHAR(512),
  status       VARCHAR(20) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE adoption_requests (
  id            BIGSERIAL PRIMARY KEY,
  pet_id        BIGINT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  adopter_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message       TEXT,
  status        VARCHAR(20) NOT NULL,
  requested_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at  TIMESTAMP NULL
);
