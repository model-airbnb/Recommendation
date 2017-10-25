const { client } = require('./client');

module.exports.addBookingDetail = (obj) => {
  const {
    listingId, searchId, neighbourhood, roomType, nightlyPrices, market, averageRating,
  } = obj;
  const bookingText = `INSERT INTO listings (listing_id, market, neighbourhood, room_type, review_scores_rating) 
    VALUES (${listingId}, '${market}', '${neighbourhood}', '${roomType}', ${averageRating}) 
    ON CONFLICT (listing_id) DO NOTHING`;
  return client.query(bookingText)
    .then(() => {
      const nightlyEntries = nightlyPrices.map((night) => {
        const nightlyText = `INSERT INTO booked_nights (listing_id, booked_at, price, search_id) 
          VALUES (${listingId}, '${night.date}'::date, ${night.price}, ${searchId})`;
        return client.query(nightlyText);
      });
      return Promise.all(nightlyEntries);
    });
};

module.exports.addSearchQuery = (obj) => {
  const {
    searchQueryId, timestamp, market, checkIn, checkOut, roomType,
  } = obj;
  const queryText = `INSERT INTO listings (search_id, market, searched_at, check_in, check_out, room_type) 
    VALUES (${searchQueryId}, '${market}', '${timestamp}', '${checkIn}', '${checkOut}',  '${roomType}') 
    ON CONFLICT (search_id) DO NOTHING`;

  return client.query(queryText);
};

module.exports.addSearchResult = (obj) => {
  const {
    searchQueryId, availableListings, scoringRules,
  } = obj;
  const results = availableListings.map((result) => {
    const resultText = `INSERT INTO listings (search_id, listing_id, scoring_rules) 
      VALUES (${searchQueryId}, '${result.listingId}', '${scoringRules}'::json) 
      ON CONFLICT DO NOTHING`;

    return client.query(resultText);
  });

  return Promise.all(results);
};
