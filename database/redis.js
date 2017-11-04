const redis = require('redis');

const redisClient = redis.createClient({ host: '13.56.185.37' });
redisClient.on('error', (err) => {
  console.log('Error ', err);
});

module.exports.redisClient = redisClient;
