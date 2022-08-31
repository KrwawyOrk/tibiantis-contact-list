const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const { retrieveData } = require("./retrieveData");

module.exports.getPlayersOnlineArray = async () => {
  const response = await retrieveData();

  const dom = new JSDOM(response);
  const playersTable = dom.window.document.querySelector(".tabi");
  const playersTableDetails = playersTable.getElementsByTagName("td");

  const playersOnlineArray = [];

  for (let i = 4; i < playersTableDetails.length; i += 3) {
    playersOnlineArray.push({
      name: playersTableDetails.item(i).textContent,
      vocation: playersTableDetails.item(i + 1).textContent,
      level: playersTableDetails.item(i + 2).textContent,
    });
  }

  // for (let i = 3; i < playersTableDetails.length; i += 3) {
  //   playersOnlineArray.push({
  //     name: playersTableDetails[i].textContent,
  //     vocation: playersTableDetails[i + 1].textContent,
  //     level: playersTableDetails[i + 2].textContent,
  //   });
  // }

  return playersOnlineArray;
};
