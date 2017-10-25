const { Client } = require('pg');

module.exports.client = new Client({
  host: process.env.PGHOST || '127.0.0.1',
  port: process.env.PORT || '5432',
  user: process.env.PGUSER || 'tyler',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'Recommendation',
});

module.exports.client.connect();
