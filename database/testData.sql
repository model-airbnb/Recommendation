COPY test_data FROM '/Users/tyler/hackreactor/Thesis/Recommendation/database/listings/listings.csv' CSV HEADER;
COPY test_calendar FROM '/Users/tyler/hackreactor/Thesis/Recommendation/database/listings/calendar.csv' CSV HEADER;

INSERT INTO listings (listing_id, neighbourhood, room_type)
  SELECT id, neighbourhood, room_type FROM test_data;

UPDATE listings
  SET review_scores_rating = floor(random()*100);

UPDATE listings
  SET market = 'San Francisco';

INSERT INTO booked_nights (listing_id, date, price)
  SELECT "listing-id", date, price::varchar::money::numeric::float8 FROM test_calendar WHERE available = true;

