const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { fetchSearchMessages, fetchBookingMessages } = require('./awsHelpers');

const app = express();
app.use(express.static(path.join(__dirname, '../client/dist/')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('hello');
});

const { PORT } = process.env;

fetchSearchMessages();
setInterval(() => fetchSearchMessages(), 300000);
//setInterval(() => fetchBookingMessages(), 10000);

app.listen(PORT, () => { console.log(`Listening on port ${PORT}`); });
