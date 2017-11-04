const { Client } = require('elasticsearch');

module.exports.elasticClient = new Client({
  host: 'https://search-elasticsearch-jadegnvjh65a5bmlhftpr27nwy.us-west-1.es.amazonaws.com',
  log: 'trace',
});
