const isWithinRange          = require('date-fns/is_within_range')
const parse                  = require('date-fns/parse');
const geoip                  = require('geoip-lite');
const southHemisphereSeasons = require('./seasons/south');
const northHemisphereSeasons = require('./seasons/north');


const isOnSouthHemisphere = (latitude) => latitude < 0

const parseLocation = (position) => { 
  return { latitude: position[0], longitude: position[1] } 
}

const findCurrentSeason = (date, seasons) => {
  let seasonName = Object.keys(seasons).filter((key) => {
    let startOfSeason = parse(seasons[key][0]);
    let endOfSeason   = parse(seasons[key][1]);

    return isWithinRange(date, startOfSeason, endOfSeason)
  })[0];

  let season = seasons[seasonName];

  return { name: seasonName, start: parse(season[0]), end: parse(season[1]) };
}


module.exports = (req, res) => {
  const currentDate = new Date().getTime();
  const ip          = req.connection.address().address;
  const geo         = geoip.lookup("207.97.227.239");
  const location    = parseLocation(geo.ll);

  const hemisphere    = isOnSouthHemisphere(location.latitude) ? "south" : "north";
  let   currentSeason = {};

  if (hemisphere == "south") {
    currentSeason = findCurrentSeason(currentDate, southHemisphereSeasons);
  } else {
    currentSeason = findCurrentSeason(currentDate, northHemisphereSeasons);
  }

  return { currentDate, location, hemisphere, currentSeason }
}