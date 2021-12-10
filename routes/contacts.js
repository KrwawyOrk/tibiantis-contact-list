const express = require("express");
const router = express.Router();

router.post("/add-contact", (req, res) => {
    const { newContactName } = req.body;
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
          maxAge: 24 * 60 * 60 * 1000,
        })
        .redirect("/contact-list");
    }
  });
  
  module.exports = router;