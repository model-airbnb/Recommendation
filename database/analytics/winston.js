const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');
const { elasticClient } = require('../clients/elasticsearch');

const esTransportOpts = {
  level: 'info',
  client: elasticClient,
  ensureMappingTemplate: false,
};

module.exports.logger = new winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new Elasticsearch(esTransportOpts),
  ],
});
