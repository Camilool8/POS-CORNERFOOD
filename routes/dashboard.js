const express = require("express");
const router = express.Router();
const Sale = require("../models/sale");

router.get("/", (req, res) => {
  Sale.find()
    .populate("products")
    .then((sales) => {
      res.render("dashboard", {
        sales: sales,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});

module.exports = router;
