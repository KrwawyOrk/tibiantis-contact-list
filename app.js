const express = require("express");
const axios = require("axios");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require(`cookie-parser`);
const { uuid } = require("uuidv4");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const app = express();
app.set("view engine", "pug");

app.use(session({ secret: "Shh, its a secret!" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const PLAYERS_ONLINE_URL = "https://tibiantis.online/?page=WhoIsOnline";

const retrieveData = async () => {
  const response = await axios.get(PLAYERS_ONLINE_URL);
  return response.data;
};

const getPlayersOnline = async () => {
  const response = await retrieveData();

  const dom = new JSDOM(response);
  const playersTable = dom.window.document.querySelector(".tabi");
  const playersTableDetails = playersTable.querySelectorAll("td");

  const playersOnlineArray = [];

  for (let i = 3; i < playersTableDetails.length; i += 3) {
    playersOnlineArray.push({
      name: playersTableDetails[i].textContent,
      vocation: playersTableDetails[i + 1].textContent,
      level: playersTableDetails[i + 2].textContent,
    });
  }

  return playersOnlineArray;
};

app.use("/", (req, res, next) => {
  if (!req.cookies.contactlist) {
    res.cookie("contactlist", [], { maxAge: 24 * 60 * 60 * 1000 });
  }

  next();
});

app.get("/", (req, res) => {
  res.redirect("/contact-list");
});

app.get("/index", (req, res) => {
  res.redirect("/contact-list");
});

const userRouter = require('./routes/contacts');
app.use('/contacts', userRouter);

app.get("/contact-list", async (req, res) => {
  const { contactlist } = req.cookies;
  const tibiantisPlayersList = await getPlayersOnline();

  contactlist.forEach((contact) => {
    const match = tibiantisPlayersList.find(
      (contactOnline) => contactOnline.name === contact.name
    );
    if (match) {
      contact.vocation = match.vocation;
      contact.level = match.level;
    }

    contact.status = match ? "Online" : "Offline";
  });

  res.cookie("contactlist", contactlist, { maxAge: 24 * 60 * 60 * 1000 });
  res.render("contactlist", { contactlist: contactlist });
});

app.get("/remove-contact/:contactId", (req, res) => {
  const { contactId } = req.params;
  const { contactlist } = req.cookies;

  const filteredArray = contactlist.filter((item) => item.id !== contactId);

  res.cookie("contactlist", filteredArray, { maxAge: 24 * 60 * 60 * 1000 });
  res.redirect("/contact-list");
});

app.get("/players-online-table", async (req, res) => {
  const playersOnlineArray = await getPlayersOnline();

  console.log(`Players online: ${playersOnlineArray.length}`);
  res.render("playersOnlineList", { playersOnlineArray: playersOnlineArray });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/apitest", (req, res) => {
  res.send({ what: "api", is: "test" });
});

app.listen(process.env.PORT || 3000);
