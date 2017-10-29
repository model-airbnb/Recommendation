const AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json');

module.exports.sqs = new AWS.SQS();
