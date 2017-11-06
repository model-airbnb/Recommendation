const { Client } = require('elasticsearch');

module.exports.elasticClient = new Client({
  host: process.env.ELASTICHOST,
//  log: 'trace',
});
