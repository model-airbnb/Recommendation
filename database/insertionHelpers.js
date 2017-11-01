const { client } = require('./client');
const { elasticClient } = require('./elasticsearch.js');

// INSERTION OPERATIONS


const addRecommendation = (message) => {
  const { coefficients } = message;
  const {
    roomType, market, checkIn, checkOut,
  } = message.rules;
  const checkInString = checkIn ? `'${checkIn}', '${checkOut}'` : 'NULL, NULL';
  const recText = `INSERT INTO scoring_recommendations (created_at, room_type, market, check_in, check_out, coefficients) 
    VALUES ('${(new Date()).toISOString()}', '${roomType}', '${market}', ${checkInString}, '${JSON.stringify(coefficients)}')`;
  return client.query(recText).catch(console.log);
};

module.exports.addRecommendations = (messages) => {
  const recs = messages.map(message => addRecommendation(message));
  return Promise.all(recs).catch(console.log);
};

module.exports.addBookingDetail = (obj) => {
  const {
    listingId, searchId, neighbourhood, roomType, nightlyPrices, market, averageRating,
  } = obj;
  const bookingText = `INSERT INTO listings (listing_id, market, neighbourhood, room_type, review_scores_rating) 
    VALUES (${listingId}, '${market}', '${neighbourhood}', '${roomType}', ${averageRating}) 
    ON CONFLICT (listing_id) 
    DO NOTHING`;
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

module.exports.addBookingPrep = (obj) => {
  const {
    listingId, searchId, neighbourhood, roomType, nightlyPrices, market, averageRating,
  } = obj;
  const bookingText = `(${listingId}, '${market}', '${neighbourhood}', '${roomType}', ${averageRating})`;

  const nightlyEntries = nightlyPrices.map(night => (
    `(${listingId}, '${night.date}'::date, ${night.price}, ${searchId})`
  ));

  return [bookingText, nightlyEntries];
};

module.exports.addBookingDetailBulk = (bookingArray, nightlyArray) => {
  const bookingText = `INSERT INTO listings (listing_id, market, neighbourhood, room_type, review_scores_rating) 
    VALUES ${bookingArray.join(', ')} 
    ON CONFLICT (listing_id) 
    DO NOTHING`;
  const nightlyText = `INSERT INTO booked_nights (listing_id, booked_at, price, search_id) 
    VALUES ${nightlyArray.join(', ')}`;

  return client.query(bookingText).then(client.query(nightlyText)).catch(err => console.log(err));
};

module.exports.addSearchQuery = (obj) => {
  const {
    searchQueryId, timestamp, market, checkIn, checkOut, roomType,
  } = obj;
  const queryText = `INSERT INTO search_queries (search_id, market, searched_at, check_in, check_out, room_type) 
    VALUES (${searchQueryId}, '${market}', '${timestamp}', '${checkIn}', '${checkOut}',  '${roomType}') 
    ON CONFLICT (search_id)
    DO NOTHING`;

  return client.query(queryText);
};

module.exports.addSearchResult = (obj) => {
  const {
    searchQueryId, availableListings, scoringRules,
  } = obj;
  const results = availableListings.map((result) => {
    const resultText = `INSERT INTO listings (search_id, listing_id, scoring_rules)
      VALUES (${searchQueryId}, '${result.listingId}', '${scoringRules}'::json)
      ON CONFLICT 
      DO NOTHING`;

    return client.query(resultText);
  });

  return Promise.all(results);
};

// INSERTION OPERATIONS ELASTIC SEARCH

module.exports.addElasticBookingDetail = (obj) => {
  const {
    listingId, searchId, neighbourhood, roomType, nightlyPrices, market, averageRating,
  } = obj;
  const nightlyEntries = nightlyPrices.map((night) => {
    const bookingObj = {
      index: 'bookings',
      type: 'booking',
      id: `${listingId}-${night.date}`,
      body: {
        listing_id: listingId,
        market,
        neighbourhood,
        room_type: roomType,
        review_scores_rating: averageRating,
        booked_at: night.date,
        price: parseFloat(night.price),
        search_id: searchId,
      },
    };

    return elasticClient.create(bookingObj).catch(console.log);
  });

  return Promise.all(nightlyEntries);
};

module.exports.addBookingObj = (obj) => {
  const {
    listingId, searchId, neighbourhood, roomType, nightlyPrices, market, averageRating,
  } = obj;
  const bookingArray = [];
  nightlyPrices.forEach((night) => {
    const indexObj = {
      index: {
        _index: 'bookings',
        _type: 'booking',
        _id: `${listingId}-${night.date}`,
      },
    };
    bookingArray.push(indexObj);
    const docObj = {
      doc: {
        listing_id: listingId,
        market,
        neighbourhood,
        room_type: roomType,
        review_scores_rating: averageRating,
        booked_at: night.date,
        price: parseFloat(night.price),
        search_id: searchId,
        created_at: new Date().toISOString(),
      },
    };
    bookingArray.push(docObj);
  });

  return bookingArray;
};

module.exports.addBulkElasticBookingDetail = (array) => {
  const bulkObj = {
    body: array,
  };
  return elasticClient.bulk(bulkObj).catch(console.log);
};
