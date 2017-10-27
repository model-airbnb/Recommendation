/* eslint-env mocha */
const { expect } = require('chai');

const {
  getListingsByType,
  getBookedNightsByDay,
  getListingByCategory,
  getNumberOfBookedNightsByPrice,
  getBookedNightsByListing,
  getAllInfoAboutListingCategory,
} = require('../database/helper');

describe('Database Spec', () => {
  describe('Listings Table', () => {
    it('Should get listings by type', (done) => {
      getListingsByType('market')
        .then((listings) => {
          expect(listings.rows[0].market).to.equal('San Francisco');
          done();
        });
    }).timeout(5000);
    it('Should get booked nights by day', (done) => {
      getBookedNightsByDay('2017-10-24')
        .then((listings) => {
          expect(listings.rows[0].booked_at.toISOString().split('T')[0]).to.equal('2017-10-24');
          done();
        });
    }).timeout(50000);
    it('Should get listings by category', (done) => {
      getListingByCategory('listing_id', 1053031)
        .then((listings) => {
          expect(listings.rows[0].listing_id).to.equal(1053031);
          done();
        });
    });
    it('Should get number of booked nights by price', (done) => {
      getNumberOfBookedNightsByPrice(150, 200)
        .then((listings) => {
          expect(listings.rows[0].count).to.equal('8428250');
          done();
        });
    }).timeout(100000);
    it('Should get booked nights by listing', (done) => {
      getBookedNightsByListing(1053031)
        .then((listings) => {
          expect(listings.rows[0].listing_id).to.equal(1053031);
          done();
        });
    }).timeout(40000);
    it('Should get all info about listing category', (done) => {
      getAllInfoAboutListingCategory('review_scores_rating', 99)
        .then((listings) => {
          expect(listings.rows[0].review_scores_rating).to.equal(99);
          done();
        });
    }).timeout(40000);
  });
});

