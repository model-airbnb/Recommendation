module.exports.knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: '5432',
    user: 'tyler',
    password: '',
    database: 'Recommendation',
    charset: 'utf8',
  },
});

module.exports.bookshelf = require('bookshelf')(module.exports.knex);
