/* eslint-env mocha */
const { expect } = require('chai');
const {
  getListingAttributeValues,
  getBookedNightsByDay,
  getListingByAttribute,
  getNumberOfBookedNightsByPrice,
  getBookedNightsByListing,
  getAveragePriceForSearch,
} = require('../database/helpers/queryHelpers');
const {
  generateRecommendation,
} = require('../database/helpers/processHelpers');
const {
  addBookingObj,
  addBookingPrep,
  addElasticBookingDetail,
} = require('../database/helpers/insertionHelpers');

describe('Database Spec', () => {
  describe('Listings Table', () => {
    it('Should get listings by type', (done) => {
      getListingAttributeValues('market')
        .then((listings) => {
          expect(listings.rows[0].market).to.equal('San Francisco');
          done();
        });
    });
    it('Should get booked nights by day', (done) => {
      getBookedNightsByDay('2017-10-24')
        .then((listings) => {
          expect(listings.rows[0].booked_at.toISOString().split('T')[0]).to.equal('2017-10-24');
          done();
        });
    });
    it('Should get listings by category', (done) => {
      getListingByAttribute('listing_id', 2005056)
        .then((listings) => {
          expect(listings.rows[0].listing_id).to.equal(2005056);
          done();
        });
    });
    it('Should get number of booked nights by price', (done) => {
      getNumberOfBookedNightsByPrice(150, 200, '2017-09-01', '2018-01-01')
        .then((listings) => {
          expect(parseInt(listings.rows[0].count, 10)).to.be.above(0);
          done();
        });
    });
    it('Should get booked nights by listing', (done) => {
      getBookedNightsByListing(2005105, '2017-09-01', '2018-01-01')
        .then((listings) => {
          expect(listings.rows[0].listing_id).to.equal(2005105);
          done();
        });
    });
    it('Should get the average price for a search', (done) => {
      const obj = { market: 'San Francisco', room_type: 'Shared room' };
      getAveragePriceForSearch(obj, '2017-09-01', '2018-01-01')
        .then((listings) => {
          expect(listings.rows[0].avg).to.be.above(200);
          done();
        });
    });
  });
  describe('Recommendations Table', () => {
    const searchObj = `{
      "topic": "search-availability",
      "payload": {
        "searchEventId": "gt9s1syij9em2uf5",
        "request": {
          "timestamp": "2017-10-30T20:02:49.600Z",
          "visitId": "258",
          "userId": "459023",
          "market": "San Francisco",
          "checkIn": "2017-11-12",
          "checkOut": "2017-11-14",
          "roomType": "any",
          "limit": "10"
        },
        "searchResults": [
          {
            "listingId": 5858,
            "listingName": "Creative Sanctuary",
            "hostName": "Philip And Tania",
            "market": "San Francisco",
            "neighbourhood": "Bernal Heights",
            "roomType": "Entire home\/apt",
            "nightlyPrices": [
              {
                "date": "2017-11-12T08:00:00.000Z",
                "price": "$235.00"
              },
              {
                "date": "2017-11-13T08:00:00.000Z",
                "price": "$235.00"
              }
            ],
            "averageRating": 56,
            "score": 0
          },
          {
            "listingId": 7918,
            "listingName": "A Friendly Room",
            "hostName": "Aaron",
            "market": "San Francisco",
            "neighbourhood": "Haight Ashbury",
            "roomType": "Private room",
            "nightlyPrices": [
              {
                "date": "2017-11-12T08:00:00.000Z",
                "price": "$63.00"
              },
              {
                "date": "2017-11-13T08:00:00.000Z",
                "price": "$63.00"
              }
            ],
            "averageRating": 24,
            "score": 1
          },
          {
            "listingId": 8014,
            "listingName": "Newly Remodeled room in big house WIFI market",
            "hostName": "Jia",
            "market": "San Francisco",
            "neighbourhood": "Outer Mission",
            "roomType": "Private room",
            "nightlyPrices": [
              {
                "date": "2017-11-12T08:00:00.000Z",
                "price": "$60.00"
              },
              {
                "date": "2017-11-13T08:00:00.000Z",
                "price": "$60.00"
              }
            ],
            "averageRating": 9,
            "score": 2
          },
          {
            "listingId": 8142,
            "listingName": "Friendly Room Apartment Style",
            "hostName": "Aaron",
            "market": "San Francisco",
            "neighbourhood": "Haight Ashbury",
            "roomType": "Private room",
            "nightlyPrices": [
              {
                "date": "2017-11-12T08:00:00.000Z",
                "price": "$63.00"
              },
              {
                "date": "2017-11-13T08:00:00.000Z",
                "price": "$63.00"
              }
            ],
            "averageRating": 54,
            "score": 3
          },
          {
            "listingId": 8339,
            "listingName": "Historic Alamo Square Victorian",
            "hostName": "Rosy",
            "market": "San Francisco",
            "neighbourhood": "Western Addition",
            "roomType": "Entire home\/apt",
            "nightlyPrices": [
              {
                "date": "2017-11-12T08:00:00.000Z",
                "price": "$775.00"
              },
              {
                "date": "2017-11-13T08:00:00.000Z",
                "price": "$775.00"
              }
            ],
            "averageRating": 33,
            "score": 4
          },
          {
            "listingId": 8739,
            "listingName": "Mission Sunshine, with Private Bath",
            "hostName": "Ivan & Wendy",
            "market": "San Francisco",
            "neighbourhood": "Mission",
            "roomType": "Private room",
            "nightlyPrices": [
              {
                "date": "2017-11-12T08:00:00.000Z",
                "price": "$137.00"
              },
              {
                "date": "2017-11-13T08:00:00.000Z",
                "price": "$139.00"
              }
            ],
            "averageRating": 25,
            "score": 5
          },
          {
            "listingId": 9225,
            "listingName": "Artful Potrero Separate Floor with Garden",
            "hostName": "Gae",
            "market": "San Francisco",
            "neighbourhood": "Potrero Hill",
            "roomType": "Private room",
            "nightlyPrices": [
              {
                "date": "2017-11-12T08:00:00.000Z",
                "price": "$135.00"
              },
              {
                "date": "2017-11-13T08:00:00.000Z",
                "price": "$135.00"
              }
            ],
            "averageRating": 86,
            "score": 6
          },
          {
            "listingId": 10251,
            "listingName": " Victorian Suite in Inner Mission",
            "hostName": "Roman & Sarah",
            "market": "San Francisco",
            "neighbourhood": "Mission",
            "roomType": "Entire home\/apt",
            "nightlyPrices": [
              {
                "date": "2017-11-12T08:00:00.000Z",
                "price": "$300.00"
              },
              {
                "date": "2017-11-13T08:00:00.000Z",
                "price": "$300.00"
              }
            ],
            "averageRating": 0,
            "score": 7
          },
          {
            "listingId": 10832,
            "listingName": "Union Square Modern Loft",
            "hostName": "Bernat",
            "market": "San Francisco",
            "neighbourhood": "Downtown\/Civic Center",
            "roomType": "Entire home\/apt",
            "nightlyPrices": [
              {
                "date": "2017-11-12T08:00:00.000Z",
                "price": "$156.00"
              },
              {
                "date": "2017-11-13T08:00:00.000Z",
                "price": "$156.00"
              }
            ],
            "averageRating": 23,
            "score": 8
          },
          {
            "listingId": 11009,
            "listingName": "XL Marina Flat\/Trendy (Flat Street)",
            "hostName": "Kathleen",
            "market": "San Francisco",
            "neighbourhood": "Marina",
            "roomType": "Entire home\/apt",
            "nightlyPrices": [
              {
                "date": "2017-11-12T08:00:00.000Z",
                "price": "$475.00"
              },
              {
                "date": "2017-11-13T08:00:00.000Z",
                "price": "$475.00"
              }
            ],
            "averageRating": 94,
            "score": 9
          }
        ]
      }
    }`;
    const bookingObj = '{"payload":{"listingId":2005034,"userId":90108,"searchId":7005054,"market":"San Francisco","neighbourhood":"Pacific Heights","roomType":"Shared room","averageRating":34,"nightlyPrices":[{"date":"2017-10-20","price":230}]}}';
    it('Should generate a recommendation', (done) => {
      generateRecommendation(JSON.parse(searchObj))
        .then((rec) => {
          expect(rec.coefficients.price).to.be.above(-2);
          expect(rec.coefficients.price).to.be.below(2);
          done();
        });
    });
    it('Should process a booking obj', (done) => {
      const obj = addBookingObj(JSON.parse(bookingObj));
      expect(obj[1].doc.listing_id).to.be.equal(2005034);
      expect(obj[1].doc.market).to.be.equal('San Francisco');
      expect(obj[1].doc.neighbourhood).to.be.equal('Pacific Heights');
      expect(obj[1].doc.room_type).to.be.equal('Shared room');
      done();
    });
    it('Should process a booking prep', (done) => {
      const arr = addBookingPrep(JSON.parse(bookingObj));
      expect(arr[0]).to.be.equal('(2005034, \'San Francisco\', \'Pacific Heights\', \'Shared room\', 34)');
      expect(arr[1][0]).to.be.equal('(2005034, \'2017-10-20\'::date, 230, \'7005054\')');
      done();
    });
  });
});

