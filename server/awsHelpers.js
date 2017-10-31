const { sqs } = require('../server/aws');
const {
  addBookingPrep,
  addBookingDetailBulk,
  addBookingObj,
  addBulkElasticBookingDetail,
  addRecommendations,
} = require('../database/insertionHelpers');
const {
  generateRecommendation,
} = require('../database/processHelpers');

const BOOKING_URL = ' https://sqs.us-west-1.amazonaws.com/455252795481/booking-details';
const RECOMMENDATION_URL = 'https://sqs.us-west-1.amazonaws.com/455252795481/ModelAirbnb-Recommendation';
const SEARCH_URL = 'https://sqs.us-west-1.amazonaws.com/766255721592/ModelAirbnb-Search';

// INSERTION OPERATIONS: SEARCH (SQS)

const sendRecommendationMessage = message => (
  new Promise((resolve, reject) => {
    const params = {
      MessageBody: JSON.stringify({
        topic: 'scoring-coefficients',
        payload: message,
      }),
      QueueUrl: RECOMMENDATION_URL,
    };

    sqs.sendMessage(params, (err) => {
      if (err) reject(err);
      else resolve(message);
    });
  })
);

const sendRecommendationMessages = (messages) => {
  console.log('sending messages', messages);
  const messageArray = messages.map(message => sendRecommendationMessage(message));
  return Promise.all(messageArray);
};

const getSearchMessages = () => (
  new Promise((resolve, reject) => {
    const params = {
      QueueUrl: SEARCH_URL,
      MaxNumberOfMessages: 10,
    };
    sqs.receiveMessage(params, (err, data) => {
      if (err) reject(err);
      if (!data.Messages) resolve([]);
      else {
        const parsedMessages = data.Messages.map(message => (JSON.parse(message.Body)));
        resolve(parsedMessages);
      }
    });
  })
);

const addSearchMessages = (messages) => {
  for (let i = 0; i < messages.length; i += 1) {
    generateRecommendation(messages[i]);
  }
  console.log('search messages');
  const messagesArray = messages.map(message => generateRecommendation(message));
  return Promise.all(messagesArray)
    .then(allMessages => allMessages.filter(message => message.coefficients.priceCoefficient !== null));
};

module.exports.fetchSearchMessages = () => {
  const searches = [];
  for (let i = 0; i < 1; i += 1) {
    searches.push(getSearchMessages());
  }
  return Promise.all(searches)
    .then(booked => (
      booked.reduce((a, b) => a.concat(b), [])
    ))
    .then(addSearchMessages)
    .then(sendRecommendationMessages)
    .then(addRecommendations)
    .catch(console.log);
};

// INSERTION OPERATIONS: BOOKING (SQS)
module.exports.sendBookingDetailMessage = message => (
  new Promise((resolve, reject) => {
    const params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: BOOKING_URL,
    };

    sqs.sendMessage(params, (err, data) => {
      if (err) reject(err);
      else resolve(data.MessageId);
    });
  })
);

const getBookingMessages = () => (
  new Promise((resolve, reject) => {
    const params = {
      QueueUrl: BOOKING_URL,
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
        QueueUrl: BOOKING_URL,
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

module.exports.fetchSearchMessages();
