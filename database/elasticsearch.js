const { Client } = require('elasticsearch');

module.exports.elasticClient = new Client({
  host: 'localhost:9200',
  log: 'trace',
});
