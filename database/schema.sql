DROP DATABASE IF EXISTS recommendation;
CREATE DATABASE recommendation;

CREATE TABLE listings (
  listing_id INT NOT NULL PRIMARY KEY,
  market VARCHAR(50),
  neighbourhood VARCHAR(50),
  room_type VARCHAR(50),
  review_scores_rating INT
);

CREATE TABLE search_queries (
  search_id INT NOT NULL PRIMARY KEY,
  market VARCHAR(50),
  searched_at DATE NOT NULL,
  room_type VARCHAR(50),
  max_price MONEY,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL
);

CREATE INDEX searched_at_idx ON search_queries (searched_at);

CREATE TABLE search_results (
  search_id INT NOT NULL REFERENCES search_queries(search_id),
  listing_id INT NOT NULL REFERENCES listings(listing_id),
  scoring_rules JSON
);

CREATE TABLE booked_nights (
  listing_id INT NOT NULL REFERENCES listings(listing_id),
  booked_at DATE NOT NULL,
  price MONEY,
  search_id INT NOT NULL
);

CREATE INDEX booked_at_idx ON booked_nights (booked_at);

CREATE TABLE rules (
  id SERIAL UNIQUE NOT NULL PRIMARY KEY,
  room_type VARCHAR(50),
  market VARCHAR(50),
  neighbourhood VARCHAR(50)
);
CREATE TABLE coefficients (
  id SERIAL UNIQUE NOT NULL PRIMARY KEY,
  price_coefficient FLOAT
);
CREATE TABLE scoring_recommendations (
  rules_id INT NOT NULL REFERENCES rules(id),
  coefficient_id INT NOT NULL REFERENCES coefficients(id)
);