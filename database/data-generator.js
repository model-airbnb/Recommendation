const { addBookingDetail, addSearchQuery, addSearchResult } = require('./helper');

const neighbourhoods = ['Seacliff', 'Haight Ashbury', 'Outer Mission', 'Downtown/Civic Center',
  'Diamond Heights', 'Lakeshore', 'Russian Hill', 'Noe Valley', 'Inner Sunset', 'Outer Richmond',
  'Crocker Amazon', 'Excelsior', 'Parkside', 'Financial District', 'Ocean View', 'Mission',
  'West of Twin Peaks', 'Inner Richmond', 'Marina', 'Bayview', 'Pacific Heights',
  'South of Market', 'Potrero Hill', 'Castro/Upper Market', 'Twin Peaks', 'Bernal Heights',
  'Chinatown', 'North Beach', 'Nob Hill', 'Outer Sunset', 'Western Addition',
  'Golden Gate Park', 'Visitacion Valley'];

const roomType = ['Private room', 'Entire home/apt', 'Shared room'];

const startDate = '2018-09-01T23:59:59Z';

const generateNightlyPrices = (numNights, price = 100, offset = 1) => {
  const nightsArray = [];
  for (let i = 0; i < numNights; i += 1) {
    const date = new Date(startDate);
    date.setDate(i + offset);
    const obj = {
      date: date.toISOString().split('T')[0],
      price: date.getDay() >= 5 ? price * 1.25 : price,
    };
    nightsArray.push(obj);
  }
  return nightsArray;
};

const generateSingleBooking = (listingId, offset = 1) => {
  const nightlyPrice = (listingId % 300) + 50;
  return {
    listingId,
    userId: Math.floor(Math.random() * 100000),
    searchId: listingId + offset + 5000000,
    market: 'San Francisco',
    neighbourhood: neighbourhoods[listingId % 33],
    roomType: roomType[listingId % 3],
    averageRating: listingId % 100,
    nightlyPrices: generateNightlyPrices(Math.floor(Math.random() * 6) + 1, nightlyPrice, offset),
  };
};

const generateBookingDetails = async (start = 1000000, finish = 2000000) => {
  for (let i = start; i < finish; i += 1) {
    for (let j = 1; j <= 99; j += 7) {
      await addBookingDetail(generateSingleBooking(i, j));
    }
  }
};

generateBookingDetails();

