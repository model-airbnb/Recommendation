const { client } = require('./client');

// QUERIES

module.exports.getListingAttributeValues = (string) => {
  const param = string || '*';

  const queryText = `SELECT ${param} FROM listings`;
  return client.query(queryText).catch(err => console.log('getListingAttributeValues', err));
};

module.exports.getBookedNightsByDay = (day) => {
  const queryText = `SELECT * FROM booked_nights 
    WHERE booked_at = '${day}' `;

  return client.query(queryText).catch(err => console.log('getBookedNightsByDay', err));
};

module.exports.getListingByAttribute = (category, string) => {
  const queryText = `SELECT * FROM listings 
    WHERE ${category} = ${string}`;

  return client.query(queryText).catch(err => console.log('getListingByAttribute', err));
};

module.exports.getNumberOfBookedNightsByPrice = (minPrice, maxPrice, startDate, endDate) => {
  const queryText = `SELECT count(*) FROM booked_nights 
    WHERE price::money::numeric::float8 >= ${minPrice} 
      AND price::money::numeric::float8 <= ${maxPrice} 
      AND booked_at >= '${startDate}' 
      AND booked_at <= '${endDate}'`;

  return client.query(queryText).catch(err => console.log('getNumberOfBookedNightsByPrice', err));
};

module.exports.getBookedNightsByListing = (listingId, startDate, endDate) => {
  const queryText = `SELECT * FROM booked_nights 
  WHERE listing_id = ${listingId} 
    AND booked_at >= '${startDate}' 
    AND booked_at <= '${endDate}'`;

  return client.query(queryText).catch(err => console.log('getBookedNightsByListing', err));
};

module.exports.getAveragePriceForSearch = (parameters, startDate, endDate) => {
  const queryArray = Object.keys(parameters).map(key => (
    `listings.${key} = '${parameters[key]}'`
  ));

  const queryString = queryArray.join(' AND ');

  const queryText = `SELECT AVG(booked_nights.price::money::numeric::float8) FROM listings
    INNER JOIN booked_nights ON listings.listing_id = booked_nights.listing_id
    WHERE ${queryString} 
      AND booked_at >= '${startDate}'
      AND booked_at <= '${endDate}'`;
  return client.query(queryText).catch(err => console.log('getAllInfoAboutListingCategory', err));
};

