const { knex } = require('./bookshelf');

module.exports = () => (
  new Promise((resolve, reject) => (
    knex.schema
      .createTableIfNotExists('test_calendar', (table) => {
        table.integer('listing-id');
        table.date('date');
        table.boolean('available');
        table.string('price');
      })
      .createTableIfNotExists('test_data', (table) => {
        table.integer('id');
        table.string('name');
        table.integer('host_id');
        table.string('host_name');
        table.string('neighborhood_group');
        table.string('neighbourhood');
        table.float('latitude');
        table.float('longitude');
        table.string('room_type');
        table.integer('price');
        table.integer('minimum_nights');
        table.integer('number_of_reviews');
        table.date('last_review');
        table.float('reviews_per_month');
        table.integer('calculated_host_listings_count');
        table.integer('availability_365');
        table.unique('id');
      })
      .createTableIfNotExists('listings', (table) => {
        table.integer('listing_id');
        table.string('market');
        table.string('neighborhood');
        table.string('room_type');
        table.integer('review_scores_rating');
        table.unique('listing_id');
      })
      .createTableIfNotExists('search_queries', (table) => {
        table.integer('search_id');
        table.string('neighborhood');
        table.string('room_type');
        table.integer('search_results_id');
        table.dateTime('check_in');
        table.dateTime('check_out');
        table.unique('search_id');
      })
      .createTableIfNotExists('booked_nights', (table) => {
        table.integer('listing_id').unsigned();
        table.foreign('listing_id').references('listing_id').inTable('listings');
        table.date('date');
        table.float('price', 8);
        table.integer('search_id').unsigned();
        table.foreign('search_id').references('search_id').inTable('search_queries');
      })
      .createTableIfNotExists('rules', (table) => {
        table.increments();
        table.float('room_type', 8);
        table.string('market');
        table.string('neighborhood');
      })
      .createTableIfNotExists('coefficients', (table) => {
        table.increments();
        table.float('price_coefficient', 8);
      })
      .createTableIfNotExists('scoring_recommendations', (table) => {
        table.increments();
        table.integer('rules_id').unsigned();
        table.integer('coefficient_id').unsigned();
        table.foreign('rules_id').references('id').inTable('rules');
        table.foreign('coefficient_id').references('id').inTable('coefficients');
      })
      .then(results => resolve(results))
      .catch(err => reject(err))
  ))
);

