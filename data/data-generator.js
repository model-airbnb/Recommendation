const { sendBookingDetailMessage } = require('../server/awsHelpers.js');
const {
  addBookingDetail,
  addSearchQuery,
  addSearchResult,
  addElasticBookingDetail,
  addBookingObj,
  addBulkElasticBookingDetail,
  addBookingPrep,
  addBookingDetailBulk,
} = require('../database/helpers/insertionHelpers');

const neighbourhoods = ['Seacliff', 'Haight Ashbury', 'Outer Mission', 'Downtown/Civic Center',
  'Diamond Heights', 'Lakeshore', 'Russian Hill', 'Noe Valley', 'Inner Sunset', 'Outer Richmond',
  'Crocker Amazon', 'Excelsior', 'Parkside', 'Financial District', 'Ocean View', 'Mission',
  'West of Twin Peaks', 'Inner Richmond', 'Marina', 'Bayview', 'Pacific Heights',
  'South of Market', 'Potrero Hill', 'Castro/Upper Market', 'Twin Peaks', 'Bernal Heights',
  'Chinatown', 'North Beach', 'Nob Hill', 'Outer Sunset', 'Western Addition',
  'Golden Gate Park', 'Visitacion Valley'];

const roomType = ['Private room', 'Entire home/apt', 'Shared room'];

const STARTDATE = '2017-10-01T23:59:59Z';

const USER_ID_RANGE = 100000;
const SEARCH_ID_OFFSET = 5000000;
const MAX_NIGHTLY_PRICE = 300;
const NIGHTS_BOOKED_RANGE = 4;
const NIGHTS_UNBOOKED_RANGE = (7 - NIGHTS_BOOKED_RANGE) + 1;

const generateNightlyPrices = (numNights, price = 100, offset = 1) => {
  const bookedNights = [];
  for (let i = 0; i < numNights; i += 1) {
    const date = new Date(STARTDATE);
    date.setDate(i + offset);
    const bookedNight = {
      date: date.toISOString().split('T')[0],
      price: date.getDay() >= 5 ? price * 1.25 : price,
    };
    bookedNights.push(bookedNight);
  }
  return bookedNights;
};

const generateSingleBooking = (listingId, offset = 1) => {
  const nightlyPrice = (listingId % MAX_NIGHTLY_PRICE) + 50;
  const randomNumberOfNights = Math.ceil(Math.random() * NIGHTS_BOOKED_RANGE);
  return {
    listingId,
    userId: Math.floor(Math.random() * USER_ID_RANGE),
    searchId: listingId + offset + SEARCH_ID_OFFSET,
    market: 'San Francisco',
    neighbourhood: neighbourhoods[listingId % neighbourhoods.length],
    roomType: roomType[listingId % roomType.length],
    averageRating: listingId % 100,
    nightlyPrices: generateNightlyPrices(randomNumberOfNights, nightlyPrice, offset),
  };
};

const generateBookingDetails = async (start = 1000000, finish = 2000000) => {
  let bulk = [];
  for (let listingId = start; listingId < finish; listingId += 1) {
    for (let startingDay = 5; startingDay <= 129; startingDay += 7) {
      const randomStartingDay = startingDay + Math.floor(Math.random() * NIGHTS_UNBOOKED_RANGE);
      bulk.push(addBookingDetail(generateSingleBooking(listingId, randomStartingDay)));
    }
    if (listingId % 10000 === 0) {
      await Promise.all(bulk)
        .then(() => { bulk = []; })
        .catch(console.log);
    }
  }
};

const generateBulkBookingDetails = async (start = 1900000, finish = 2000000) => {
  let bulkBooking = [];
  let bulkNightly = [];
  for (let listingId = start; listingId < finish; listingId += 1) {
    for (let startingDay = 5; startingDay <= 129; startingDay += 7) {
      const randomStartingDay = startingDay + Math.floor(Math.random() * NIGHTS_UNBOOKED_RANGE);
      const bulk = addBookingPrep(generateSingleBooking(listingId, randomStartingDay));
      bulkBooking.push(bulk[0]);
      bulkNightly.push(bulk[1]);
    }
    if (listingId % 10000 === 0) {
      await addBookingDetailBulk(bulkBooking, bulkNightly)
        .then(() => {
          bulkBooking = [];
          bulkNightly = [];
        })
        .catch(console.log);
    }
  }
};

const generateElasticBookingDetails = async (start = 1500000, finish = 2000000) => {
  let bulk = [];
  for (let listingId = start; listingId < finish; listingId += 1) {
    for (let startingDay = 5; startingDay <= 129; startingDay += 7) {
      const randomStartingDay = startingDay + Math.floor(Math.random() * NIGHTS_UNBOOKED_RANGE);
      bulk = bulk.concat(addBookingObj(generateSingleBooking(listingId, randomStartingDay)));
    }
    if (listingId % 100 === 0) {
      await addBulkElasticBookingDetail(bulk)
        .then(() => { bulk = []; })
        .catch(console.log);
    }
  }
};

const generateSQSBookingDetails = async (start = 2005000, finish = 2020000) => {
  let bulk = [];
  for (let listingId = start; listingId < finish; listingId += 1) {
    for (let startingDay = 5; startingDay <= 129; startingDay += 7) {
      const randomStartingDay = startingDay + Math.floor(Math.random() * NIGHTS_UNBOOKED_RANGE);
      bulk = bulk.concat(sendBookingDetailMessage(generateSingleBooking(listingId, randomStartingDay)));
    }
    if (listingId % 10000 === 0) {
      await Promise.all(bulk)
        .then(() => { bulk = []; })
        .catch(console.log);
    }
  }
};

// generateSQSBookingDetails();
// generateBookingDetails();
// generateBulkBookingDetails();
//generateElasticBookingDetails();
