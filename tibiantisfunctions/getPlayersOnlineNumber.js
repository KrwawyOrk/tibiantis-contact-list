const { getPlayersOnlineArray } = require("./getPlayersOnlineArray");

module.exports.getPlayersOnlineNumber = async () => {
  const array = await getPlayersOnlineArray();
  
  return array.length;
};
