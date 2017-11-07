const { sqs } = require('../server/aws');
const {
  addBookingPrep,
  addBookingDetailBulk,
  addBookingObj,
  addBulkElasticBookingDetail,
  addRecommendations,
} = require('../database/helpers/insertionHelpers');
const { generateRecommendation } = require('../database/helpers/processHelpers');

const { BOOKING_URL, RECOMMENDATION_URL, SEARCH_URL } = process.env;

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

const sendRecommendationMessage = (message, i) => (
  {
    Id: Date.now().toString() + i,
    MessageBody: JSON.stringify({
      topic: 'scoring-coefficients',
      payload: message,
    }),
  }
);

const sendRecommendationMessages = messages => (
  new Promise((resolve, reject) => {
    const messageArray = messages.map((message, i) => sendRecommendationMessage(message, i));
    const params = {
      Entries: messageArray,
      QueueUrl: RECOMMENDATION_URL,
    };
    sqs.sendMessageBatch(params, (err) => {
      if (err) reject(err);
      else resolve(messages);
    });
    console.log('Sending Recommendation Messages');
  })
);

const addSearchMessages = (messages) => {
  const messagesArray = messages.map(message => generateRecommendation(message));
  return Promise.all(messagesArray)
    .then(allMessages => allMessages.filter(message => message.coefficients.price !== null));
};


const fetch10Messages = () => (
  getMessages(SEARCH_URL)
    .then(addSearchMessages)
    .then(sendRecommendationMessages)
    .catch(console.log)
);

module.exports.fetchSearchMessages = async () => {
  const finishedMessages = [];
  for (let i = 0; i < 100; i += 1) {
    finishedMessages.push(await fetch10Messages());
  }
  addRecommendations(finishedMessages.reduce((a, b) => a.concat(b), [])).catch(console.log);
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

module.exports.fetchBookingMessages = () => {
  const bookings = [];
  for (let i = 0; i < 100; i += 1) {
    bookings.push(getMessages(BOOKING_URL));
  }
  return Promise.all(bookings)
    .then(booked => (
      booked.reduce((a, b) => a.concat(b), [])
    ))
    .then((messages) => {
      if (messages.length === 0) return [];
      addElasticBookingMessages(messages);
      addBookingMessages(messages);
      return messages;
    })
    .catch(console.log);
};
