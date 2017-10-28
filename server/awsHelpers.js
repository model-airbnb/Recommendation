const { sqs } = require('../server/aws');
const {
  addBookingPrep,
  addBookingDetailBulk,
  addBookingObj,
} = require('../database/insertionHelpers');


const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/455252795481/booking_details';

// INSERTION OPERATIONS (SQS)

module.exports.sendBookingDetailMessage = message => (
  new Promise((resolve, reject) => {
    const params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: QUEUE_URL,
    };

    return sqs.sendMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.MessageId);
      }
    });
  })
);

module.exports.getBookingMessages = () => (
  new Promise((resolve, reject) => {
    const params = {
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
    };

    return sqs.receiveMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const deleteParams = {
          QueueUrl: QUEUE_URL,
          ReceiptHandle: data.Messages[0].ReceiptHandle,
        };
        sqs.deleteMessage(deleteParams, (err2, data2) => {
          if (err2) {
            reject(err2, data2);
          } else {
            const messages = data.Messages.map(message => (JSON.parse(message.Body)));
            resolve(messages);
          }
        });
      }
    });
  })
);

module.exports.addBookingMessages = (messages) => {
  const bulkBooking = [];
  const bulkNightly = [];
  for (let i = 0; i < messages.length; i += 1) {
    const bulk = addBookingPrep(messages[i]);
    bulkBooking.push(bulk[0]);
    bulkNightly.push(bulk[1]);
  }
  return addBookingDetailBulk(bulkBooking, bulkNightly);
};

module.exports.addElasticBookingMessages = (messages) => {
  let bulk = [];
  for (let i = 0; i < messages.length; i += 1) {  
    bulk = bulk.concat(addBookingObj(messages[i]));
  }
};

module.exports.getBookingMessages()
  .then((messages) => {
    module.exports.addBookingMessages(messages);
    module.exports.addElasticBookingMessages(messages);
  })
  .catch(err => console.log(err));
