const axios = require("axios");

module.exports.retrieveData = async () => {
    const PLAYERS_ONLINE_URL = "https://tibiantis.online/?page=WhoIsOnline";
  
    const response = await axios.get(PLAYERS_ONLINE_URL);
    return response.data;
  };