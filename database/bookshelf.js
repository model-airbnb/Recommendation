module.exports.knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.PGHOST || '127.0.0.1',
    port: process.env.PORT || '5432',
    user: process.env.PGUSER || 'tyler',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'Recommendation',
    charset: 'utf8',
  },
});

module.exports.bookshelf = require('bookshelf')(module.exports.knex);
