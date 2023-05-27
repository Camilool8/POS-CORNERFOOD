const express = require("express");
const router = express.Router();
const User = require("../models/user");

const message = "This user already exists!";
const display = "none";

router.get("/", (req, res) => {
  let message = "";
  res.render("login", { message: message, display: display });
});

router.post("/login", async (req, res) => {
  const name = req.body.username;
  const password = req.body.password;

  await User.findOne({ name: name }).then((user) => {
    if (!user) {
      let display = "block";
      let message = "Ha habido un error con el usuario o la contraseña";
      res.render("login", { message: message, display: display });
    } else {
      if (user.password === password) {
        res.redirect("/dashboard");
      } else {
        let display = "block";
        let message = "Ha habido un error con el usuario o la contraseña";
        res.render("login", { message: message, display: display });
      }
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
