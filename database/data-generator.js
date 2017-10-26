const { addBookingDetail, addSearchQuery, addSearchResult, addElasticBookingDetail, addBookingObj, addBulkElasticBookingDetail } = require('./helper');

const NEIGHBOURHOODS = ['Seacliff', 'Haight Ashbury', 'Outer Mission', 'Downtown/Civic Center',
  'Diamond Heights', 'Lakeshore', 'Russian Hill', 'Noe Valley', 'Inner Sunset', 'Outer Richmond',
  'Crocker Amazon', 'Excelsior', 'Parkside', 'Financial District', 'Ocean View', 'Mission',
  'West of Twin Peaks', 'Inner Richmond', 'Marina', 'Bayview', 'Pacific Heights',
  'South of Market', 'Potrero Hill', 'Castro/Upper Market', 'Twin Peaks', 'Bernal Heights',
  'Chinatown', 'North Beach', 'Nob Hill', 'Outer Sunset', 'Western Addition',
  'Golden Gate Park', 'Visitacion Valley'];

const ROOMTYPE = ['Private room', 'Entire home/apt', 'Shared room'];

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
    neighbourhood: NEIGHBOURHOODS[listingId % NEIGHBOURHOODS.length],
    roomType: ROOMTYPE[listingId % ROOMTYPE.length],
    averageRating: listingId % 100,
    nightlyPrices: generateNightlyPrices(randomNumberOfNights, nightlyPrice, offset),
  };
};

const generateBookingDetails = async (start = 1000000, finish = 2000000) => {
  for (let listingId = start; listingId < finish; listingId += 1) {
    for (let startingDay = 5; startingDay <= 129; startingDay += 7) {
      const randomStartingDay = startingDay + Math.floor(Math.random() * NIGHTS_UNBOOKED_RANGE);
      await addBookingDetail(generateSingleBooking(listingId, randomStartingDay));
    }
  }
};

const generateElasticBookingDetails = async (start = 1000000, finish = 2000000) => {
  let bulk = [];
  for (let listingId = start; listingId < finish; listingId += 1) {
    for (let startingDay = 5; startingDay <= 129; startingDay += 7) {
      const randomStartingDay = startingDay + Math.floor(Math.random() * NIGHTS_UNBOOKED_RANGE);
      bulk = bulk.concat(addBookingObj(generateSingleBooking(listingId, randomStartingDay)));
    }
    if (listingId % 1000 === 0) {
      await addBulkElasticBookingDetail(bulk)
        .then(() => { bulk = []; })
        .catch(err => console.log(err));
    }
  }
};

generateElasticBookingDetails();
