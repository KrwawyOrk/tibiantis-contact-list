const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require(`cookie-parser`);

const { uuid } = require("uuidv4");

const {
  getPlayersOnlineArray,
} = require("./tibiantisfunctions/getPlayersOnlineArray");
const {
  getPlayersOnlineNumber,
} = require("./tibiantisfunctions/getPlayersOnlineNumber");

const app = express();
app.set("view engine", "pug");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const WEEK = 168 * 60 * 60 * 1000;

app.use(async (req, res, next) => {
  app.locals.tibiantisOnlineNumber = await getPlayersOnlineNumber();
  app.locals.contactsNumber = req.cookies.contactlist
    ? req.cookies.contactlist.length
    : 0;

  next();
});

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
  res.render("playersOnlineList", { playersOnlineArray: playersOnlineArray });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/sort-by-name", (req, res) => {
  const { contactlist } = req.cookies;
  contactlist.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }

    return 0;
  });

  res.cookie("contactlist", contactlist, { maxAge: WEEK });
  res.redirect("/contact-list");
});

app.get("/sort-by-level", (req, res) => {
  const { contactlist } = req.cookies;

  contactlist.sort((a, b) => b.level - a.level);

  res.cookie("contactlist", contactlist, { maxAge: WEEK });
  res.redirect("/contact-list");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `App is running on port ${
      process.env.PORT ? "some heroku port" : "3000"
    }...`
  );
});
