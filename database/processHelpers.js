const { client } = require('./client');
const {
  addSearchQuery,
  addSearchResult,
} = require('./insertionHelpers');
const {
  getAveragePriceForSearch,
} = require('./queryHelpers');

// PROCESS OPERATORS

const convertAveragePriceToScore = (averagePrice) => {
  const averageDecimal = averagePrice % 1;
  return averageDecimal + 1;
};

module.exports.generateRecommendation = (obj) => {
  const {
    market, checkIn, checkOut, roomType,
  } = obj;
  const searchReqs = (roomType === 'any') ? { market } : { market, room_type: roomType };

  getAveragePriceForSearch(searchReqs, checkIn, checkOut).then((result) => {
    const averagePrice = result.rows[0].avg;
    return {
      date: Date.now(),
      rules: {
        market,
        roomType,
      },
      coefficients: {
        priceCoefficient: convertAveragePriceToScore(averagePrice),
      },
    };
  });
};