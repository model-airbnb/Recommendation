const { client } = require('./client');
const { redisClient } = require('./redis');
const {
  addSearchQuery,
  addSearchResult,
} = require('./insertionHelpers');
const {
  getAveragePriceForSearch,
} = require('./queryHelpers');

// PROCESS OPERATORS

const convertAveragePriceToScore = (averagePrice, scoringObj) => (
  new Promise((resolve, reject) => {
    redisClient.hget('scoring', JSON.stringify(scoringObj), (err, reply) => {
      if (err) reject(err);
      redisClient.hset('scoring', JSON.stringify(scoringObj), averagePrice, () => {
        if (reply) resolve((averagePrice - reply) / averagePrice);
        else resolve(0);
      });
    });
  })
);

module.exports.generateRecommendation = (obj) => {
  const {
    market, checkIn, checkOut, roomType,
  } = obj.payload.searchRequest;
  const searchReqs = (roomType === 'any') ? { market } : { market, room_type: roomType };
  const scoringObj = {
    market, checkIn, checkOut, roomType,
  };
  return getAveragePriceForSearch(searchReqs, checkIn, checkOut)
    .then(result => convertAveragePriceToScore(result.rows[0].avg, scoringObj))
    .then(score => (
      {
        date: (new Date()).toISOString(),
        rules: scoringObj,
        coefficients: {
          priceCoefficient: score,
        },
      }
    ));
};
