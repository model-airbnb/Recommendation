const createTables = require('./database/schema');

createTables()
  .then(() => process.exit(0));
