const express = require("express");
const router = express.Router();
const Client = require("../models/client");

router.get("/", async (req, res) => {
  await Client.find().then((clients) => {
    res.render("clients", { clients: clients });
  });
});

router.post("/", async (req, res) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const limit = req.body.limit;

  const newClient = new Client({
    name,
    phone,
    limit,
    debt: 0,
  });

  await newClient.save();
  res.redirect("/clients");
});

router.post("/:id", async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const phone = req.body.phone;
  const limit = req.body.limit;
  const debt = req.body.debt;

  await Client.replaceOne(
    { _id: id },
    {
      name,
      phone,
      limit,
      debt,
    }
  ).then(() => {
    res.redirect("/clients");
  });
});

router.get("/new", (req, res) => {
  res.render("newclient");
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  await Client.findById(id).then((client) => {
    res.render("editclient", { clients: client });
  });
});

router.get("/delete/:id", async (req, res) => {
  const id = req.params.id;

  await Client.deleteOne({ _id: id }).then(() => {
    res.redirect("/clients");
  });
});

module.exports = router;
