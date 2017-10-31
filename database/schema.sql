DROP DATABASE IF EXISTS recommendation;
CREATE DATABASE recommendation;

CREATE TABLE listings (
  listing_id INT NOT NULL PRIMARY KEY,
  market VARCHAR(50),
  neighbourhood VARCHAR(50),
  room_type VARCHAR(50),
  review_scores_rating INT
);

CREATE INDEX market_idx ON listings (market);
CREATE INDEX room_type_idx ON listings (room_type);
CREATE INDEX review_scores_rating_idx ON listings (review_scores_rating);

CREATE TABLE search_queries (
  search_id INT NOT NULL PRIMARY KEY,
  market VARCHAR(50),
  searched_at DATE NOT NULL,
  room_type VARCHAR(50),
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
CREATE INDEX price_idx ON booked_nights (price);
CREATE INDEX listing_id_idx ON booked_nights (listing_id);

CREATE TABLE scoring_recommendations (
  id SERIAL UNIQUE NOT NULL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL,
  room_type VARCHAR(50),
  market VARCHAR(50),
  check_in DATE,
  check_out DATE,
  coefficients JSON
);
