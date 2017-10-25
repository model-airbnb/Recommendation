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
          VALUES (${listingId},'${night.date}'::date,${night.price},${searchId}) `;
        return client.query(nightlyText);
      });
      return Promise.all(nightlyEntries);
    });
};

module.exports.addSearchQuery = (obj) => {
  const {
    searchQueryId, searched_at, market, checkIn, checkOut, roomType, maxPrice,
  } = obj;
  const queryObj = {
    search_id: searchQueryId,
    market,
    searched_at,
    check_in: checkIn,
    check_out: checkOut,
    room_type: roomType,
    max_price: maxPrice,
  };

 // return model.SearchQueries.forge(queryObj).save();
};

module.exports.addSearchResult = (obj) => {
  const {
    searchQueryId, availableListings, scoringRules,
  } = obj;
  const results = availableListings.map((result) => {
    const resultObj = {
      search_id: searchQueryId,
      listing_id: result.listingId,
      scoring_rules: JSON.stringify(scoringRules),
    };

 //   return model.SearchResults.forge(resultObj).save();
  });

  return Promise.all(results);
};
