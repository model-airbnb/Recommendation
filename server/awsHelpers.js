const { sqs } = require('../server/aws');
const {
  addBookingPrep,
  addBookingDetailBulk,
  addBookingObj,
  addBulkElasticBookingDetail,
} = require('../database/insertionHelpers');


const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/455252795481/booking_details';

// INSERTION OPERATIONS (SQS)

module.exports.sendBookingDetailMessage = message => (
  new Promise((resolve, reject) => {
    const params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: QUEUE_URL,
    };

    sqs.sendMessage(params, (err, data) => {
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
    sqs.receiveMessage(params, (err, data) => {
      if (err) reject(err);
      else resolve(data.Messages || []);
    });
  })
    .then(messages => new Promise((resolve, reject) => {
      if (messages.length === 0) resolve(messages);
      const deleteParams = {
        QueueUrl: QUEUE_URL,
        ReceiptHandle: messages[0].ReceiptHandle,
      };
      sqs.deleteMessage(deleteParams, (err) => {
        if (err) reject(err);
        else {
          const parsedMessages = messages.map(message => (JSON.parse(message.Body)));
          resolve(parsedMessages);
        }
      });
    }))
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
  addBulkElasticBookingDetail(bulk);
};

module.exports.fetchMessages = () => {
  const bookings = [];
  for (let i = 0; i < 300; i += 1) {
    bookings.push(getBookingMessages());
  }
  return Promise.all(bookings)
    .then(booked => (
      booked.reduce((a, b) => a.concat(b), [])
    ))
    .then((messages) => {
      addBookingMessages(messages);
      addElasticBookingMessages(messages);
    })
    .catch(console.log);
};

setInterval(() => module.exports.fetchMessages(), 10000);
