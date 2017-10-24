const model = require('../database/models');

module.exports.addBookingDetail = (obj) => {
  const {
    listingId, searchId, neighbourhood, roomType, nightlyPrices,
  } = obj;
  const bookingObj = {
    listing_id: listingId, market: 'San Francisco', neighborhood: neighbourhood, room_type: roomType, review_scores_rating: Math.floor(Math.random() * 100),
  };
  const nightlyEntries = nightlyPrices.map((nightlyPrice) => {
    const nightlyObj = {
      listing_id: listingId,
      date: nightlyPrice.date,
      price: nightlyPrice.price,
      search_id: searchId,
    };
    return model.NightlyPrices.forge(nightlyObj).save();
  });

  return Promise.all(nightlyEntries)
    .then(model.BookingDetails.forge(bookingObj).save());
};
