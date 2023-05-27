const express = require("express");
const router = express.Router();
const User = require("../models/user");

const message = "This user already exists!";
const display = "none";

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const name = req.body.username;
  const password = req.body.password;

  await User.findOne({ name: name }).then((user) => {
    if (user.password === password) {
      res.redirect("/dashboard");
    } else {
      res.redirect("/");
    }
  });
});

router.get("/register", (req, res) => {
  res.render("register", { message: message, display: display });
});

router.post("/register", async (req, res) => {
  const name = req.body.username;
  const password = req.body.password;

  const newUser = new User({
    name,
    password,
  });

  await User.findOne({ name: name }).then((user) => {
    if (user) {
      let display1 = "block";
      res.render("register", { message: message, display: display1 });
    } else {
      newUser.save();
      res.redirect("/");
    }
  });
});

module.exports = router;
