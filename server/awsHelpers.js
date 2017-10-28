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

const getBookingMessages = () => (
  new Promise((resolve, reject) => {
    const params = {
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
    };

    return sqs.receiveMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (data.Messages) {
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
        } else {
          resolve([]);
        }
      }
    });
  })
);

const addBookingMessages = (messages) => {
  const bulkBooking = [];
  const bulkNightly = [];
  for (let i = 0; i < messages.length; i += 1) {
    const bulk = addBookingPrep(messages[i]);
    bulkBooking.push(bulk[0]);
    bulkNightly.push(bulk[1]);
  }
  return addBookingDetailBulk(bulkBooking, bulkNightly);
};

const addElasticBookingMessages = (messages) => {
  let bulk = [];
  for (let i = 0; i < messages.length; i += 1) {
    bulk = bulk.concat(addBookingObj(messages[i]));
  }
};

module.exports.fetchMessages = () => {
  const bookings = [];
  for (let i = 0; i < 300; i += 1) {
    bookings.push(getBookingMessages());
  }
  return Promise.all(bookings)
    .then((booked) => {
      const flatBooked = booked.reduce((a, b) => a.concat(b), []);
      return flatBooked;
    })
    .then((messages) => {
      addBookingMessages(messages);
      addElasticBookingMessages(messages);
    })
    .catch(err => console.log(err));
};

setInterval(() => module.exports.fetchMessages(), 10000);
