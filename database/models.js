const { bookshelf } = require('./bookshelf');

module.exports.BookingDetails = bookshelf.Model.extend({
  tableName: 'booking_details',
});

module.exports.SearchQueries = bookshelf.Model.extend({
  tableName: 'search_queries',
});

module.exports.NightlyPrices = bookshelf.Model.extend({
  tableName: 'nightly_prices',
});

module.exports.ScoringRecommendation = bookshelf.Model.extend({
  tableName: 'scoring_recommendation',
});

module.exports.Rules = bookshelf.Model.extend({
  tableName: 'rules',
});

module.exports.Coefficients = bookshelf.Model.extend({
  tableName: 'coefficients',
});

