const express = require("express");
const router = express.Router();
const Client = require("../models/client");
const Sale = require("../models/sale");

router.get("/", async (req, res) => {
  await Client.find().then((clients) => {
    res.render("clients", { clients: clients });
  });
});

router.post("/", async (req, res) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const comments = req.body.comments;
  const limit = req.body.limit;

  const newClient = new Client({
    name,
    phone,
    comments,
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
  const comments = req.body.comments;
  const limit = req.body.limit;
  const debt = req.body.debt;

  await Client.replaceOne(
    { _id: id },
    {
      name,
      phone,
      comments,
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

router.get("/payoff/:id", async (req, res) => {
  const id = req.params.id;

  await Client.findById(id)
    .then((client) => {
      client.debt = 0;
      client.save();
      Sale.find({ client: client.name }).then((sales) => {
        sales.forEach((sale) => {
          sale.isPaid = true;
          sale.save();
        });
      });
    })
    .finally(() => {
      res.redirect("/clients");
    });
});

router.get("/invoices/:id", async (req, res) => {
  const id = req.params.id;

  await Client.findById(id).then((client) => {
    Sale.find({ client: client.name })
      .populate("products")
      .then((sales) => {
        res.render("clientinvoices", { sales: sales });
      });
  });
});

module.exports = router;
