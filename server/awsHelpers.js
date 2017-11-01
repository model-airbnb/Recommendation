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

const BOOKING_URL = 'https://sqs.us-west-1.amazonaws.com/455252795481/ModelAirbnb-Inventory';
const RECOMMENDATION_URL = 'https://sqs.us-west-1.amazonaws.com/766255721592/ModelAirbnb-Recommendations';
const SEARCH_URL = 'https://sqs.us-west-1.amazonaws.com/455252795481/ModelAirbnb-Search';

// RETRIEVAL OPERATIONS (AWS)

const getMessages = URL => (
  new Promise((resolve, reject) => {
    const params = {
      QueueUrl: URL,
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
        QueueUrl: URL,
        Entries: messages.map(message => (
          {
            Id: message.MessageId,
            ReceiptHandle: message.ReceiptHandle,
          }
        )),
      };
      sqs.deleteMessageBatch(deleteParams, (err) => {
        if (err) reject(err);
        else {
          const parsedMessages = messages.map(message => (JSON.parse(message.Body)));
          resolve(parsedMessages);
        }
      });
    }))
);
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
      console.log('message', message);
    });
  })
);

const sendRecommendationMessages = (messages) => {
  const messageArray = messages.map(message => sendRecommendationMessage(message));
  return Promise.all(messageArray);
};

const addSearchMessages = (messages) => {
  const messagesArray = messages.map(message => generateRecommendation(message));
  return Promise.all(messagesArray)
    .then(allMessages => allMessages.filter(message => message.coefficients.priceCoefficient !== null));
};


const fetch10Messages = () => (
  getMessages(SEARCH_URL)
    .then(addSearchMessages)
    .then(sendRecommendationMessages)
    .catch(console.log)
);

module.exports.fetchSearchMessages = async () => {
  const finishedMessages = [];
  for (let i = 0; i < 5; i += 1) {
    finishedMessages.push(await fetch10Messages());
  }
  console.log('this is what is being added', finishedMessages.reduce((a, b) => a.concat(b), []));
  addRecommendations(finishedMessages.reduce((a, b) => a.concat(b), []));
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
    bookings.push(getMessages(BOOKING_URL));
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
