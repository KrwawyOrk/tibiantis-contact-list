const axios = require("axios");

module.exports.retrieveData = async () => {
    const PLAYERS_ONLINE_URL = "https://tibiantis.online/?page=whoisonline";
    
    const response = await axios.get(PLAYERS_ONLINE_URL);
    return response.data;
  };