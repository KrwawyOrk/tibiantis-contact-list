const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require(`cookie-parser`);
const { uuid } = require("uuidv4");

const { getPlayersOnlineArray } = require("./tibiantisfunctions/getPlayersOnlineArray");

const app = express();
app.set("view engine", "pug");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const WEEK = 168 * 60 * 60 * 1000;

app.use("/", (req, res, next) => {
  if (!req.cookies.contactlist) {
    res.cookie("contactlist", [], { maxAge: WEEK });
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
  const tibiantisPlayersList = await getPlayersOnlineArray();

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

  res.cookie("contactlist", contactlist, { maxAge: WEEK });
  res.render("contactlist", { contactlist: contactlist });
});

app.post("/add-contact", (req, res) => {
  const { newContactName } = req.body;
  res.redirect(`/add-contact-by-name/${newContactName}`);
});

app.get("/add-contact-by-name/:newContactName", (req, res) => {
  const { newContactName } = req.params;
  const { contactlist } = req.cookies;

  if (contactlist.find((element) => element.name === newContactName)) {
    res.render("contactalreadyexists");
  } else {
    const newContact = {
      id: uuid(),
      name: newContactName,
      vocation: "?",
      level: "?",
      status: "?",
    };

    res
      .cookie("contactlist", [newContact, ...contactlist], {
        maxAge: WEEK,
      })
      .redirect("/contact-list");
  }
});

app.get("/remove-contact/:contactId", (req, res) => {
  const { contactId } = req.params;
  const { contactlist } = req.cookies;

  const filteredArray = contactlist.filter((item) => item.id !== contactId);

  res.cookie("contactlist", filteredArray, { maxAge: WEEK });
  res.redirect("/contact-list");
});

app.get("/players-online-table", async (req, res) => {
  const playersOnlineArray = await getPlayersOnlineArray();

  console.log(`Players online: ${playersOnlineArray.length}`);
  res.render("playersOnlineList", { playersOnlineArray: playersOnlineArray });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(process.env.PORT || 3000);
