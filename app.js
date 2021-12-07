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

app.get("/contact-list", async (req, res) => {
  const { contactlist } = req.cookies;
  const tibiantisPlayersList = await getPlayersOnline();

  contactlist.forEach((contact) => {
    contact.status = "Offline";

    tibiantisPlayersList.find((contactOnline) => {
      if (contactOnline.name === contact.name) {
        contact.vocation = contactOnline.vocation;
        contact.level = contactOnline.level;
        contact.status = "Online";
      }
    });
  });

  res.cookie("contactlist", contactlist, { maxAge: 24 * 60 * 60 * 1000 });
  res.render("contactlist", { contactlist: contactlist });
});

app.post("/add-contact", (req, res) => {
  const { newContactName } = req.body;
  const { contactlist } = req.cookies;

  if (contactlist.find((element) => element.name === newContactName)) {
    res.send(`The contact already exists in your list.`);
  } else {
    const newContact = {
      id: uuid(),
      name: newContactName,
      vocation: "?",
      level: "?",
      status: "?",
    };

    res
      .cookie("contactlist", [newContact, ...contactlist])
      .redirect("/contact-list");
  }
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

app.listen(process.env.PORT || 3000);
