const { client } = require('./client');
const {
  addSearchQuery,
  addSearchResult,
} = require('./insertionHelpers');
const {
  getAveragePriceForSearch,
} = require('./queryHelpers');

// PROCESS OPERATORS

module.exports.generateRecommendation = (obj) => {
  const {
    market, checkIn, checkOut, roomType,
  } = obj;
  const searchReqs = (roomType === 'any') ? { market } : { market, room_type: roomType };

  return getAveragePriceForSearch(searchReqs, checkIn, checkOut);
};

/*
  return addSearchQuery
    .then(addRecommendationWeight)
    .then(returnRecommendation);

*/

