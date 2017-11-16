const express = require('express');
const bodyParser = require('body-parser');
const { fetchSearchMessages, fetchBookingMessages } = require('./awsHelpers');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('hello');
});

const { PORT } = process.env;

fetchSearchMessages();
fetchBookingMessages();
setInterval(() => fetchSearchMessages(), 300000);
setInterval(() => fetchBookingMessages(), 100000);

app.listen(PORT, () => { console.log(`Listening on port ${PORT}`); });
