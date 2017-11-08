const { addSearchQuery, addSearchResult } = require('./insertionHelpers');
const { getAveragePriceForSearch, getAveragePriceElastic } = require('./queryHelpers');
const { client } = require('../clients/postgres');
const { redisClient } = require('../clients/redis');
const { logger } = require('../analytics/winston');

// PROCESS OPERATORS

const convertAveragePriceToScore = (averagePrice, scoringObj) => (
  new Promise((resolve, reject) => {
    if (!averagePrice) resolve(null);
    else {
      redisClient.hget('scoring', JSON.stringify(scoringObj), (err, reply) => {
        if (err) reject(err);
        redisClient.hset('scoring', JSON.stringify(scoringObj), averagePrice, () => {
          if (reply) resolve((averagePrice - reply) / averagePrice);
          else resolve(0);
        });
      });
    }
  })
);

module.exports.generateRecommendation = (obj) => {
  const {
    market, checkIn, checkOut, roomType,
  } = obj.payload.request;
  const searchReqs = (roomType === 'any') ? { market } : { market, room_type: roomType };
  const scoringObj = {
    market, checkIn, checkOut, roomType,
  };
  return getAveragePriceElastic(searchReqs, checkIn, checkOut)
    .then(average => convertAveragePriceToScore(average, scoringObj))
    .then(score => (
      {
        date: (new Date()).toISOString(),
        rules: scoringObj,
        coefficients: {
          price: score,
        },
      }
    ));
};
