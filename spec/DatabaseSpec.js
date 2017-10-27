/* eslint-env mocha */
const { expect } = require('chai');

const {
  getListingAttributeValues,
  getBookedNightsByDay,
  getListingByAttribute,
  getNumberOfBookedNightsByPrice,
  getBookedNightsByListing,
  getAllInfoAboutListingCategory,
} = require('../database/helper');

describe('Database Spec', () => {
  describe('Listings Table', () => {
    it('Should get listings by type', (done) => {
      getListingAttributeValues('market')
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
      getListingByAttribute('listing_id', 1053031)
        .then((listings) => {
          expect(listings.rows[0].listing_id).to.equal(1053031);
          done();
        });
    });
    it('Should get number of booked nights by price', (done) => {
      getNumberOfBookedNightsByPrice(150, 200, '2017-09-01', '2018-01-01')
        .then((listings) => {
          expect(parseInt(listings.rows[0].count, 10)).to.be.above(1000000);
          done();
        });
    }).timeout(100000);
    it('Should get booked nights by listing', (done) => {
      getBookedNightsByListing(1053031, '2017-09-01', '2018-01-01')
        .then((listings) => {
          expect(listings.rows[0].listing_id).to.equal(1053031);
          done();
        });
    }).timeout(40000);
    it('Should get all info about listing category', (done) => {
      getAllInfoAboutListingCategory('review_scores_rating', 75, '2017-09-01', '2018-01-01')
        .then((listings) => {
          expect(listings.rows[0].review_scores_rating).to.equal(75);
          done();
        });
    }).timeout(40000);
  });
});

