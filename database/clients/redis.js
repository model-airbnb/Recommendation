const redis = require('redis');

const redisClient = redis.createClient({ host: process.env.REDISHOST });
redisClient.on('error', (err) => {
  console.log('Error ', err);
});

module.exports.redisClient = redisClient;
