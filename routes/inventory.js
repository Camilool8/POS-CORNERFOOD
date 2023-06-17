const express = require("express");
const router = express.Router();
const Sale = require("../models/sale");
const Client = require("../models/client");

router.get("/", async (req, res) => {
  // Parse start and end dates from the query parameters
  let startDate = req.query.startDate
    ? new Date(req.query.startDate)
    : new Date(new Date().getFullYear(), 0, 1);
  let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

  // Make sure dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    res.status(400).send("Invalid date parameters");
    return;
  }

  // Fetch sales within the date range
  let sales = await Sale.find({
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  }).populate("products");

  // Fetch clients
  let clients = await Client.find();

  // Calculate total amount from sales that are not cash
  let creditAmount = 0;
  sales.forEach((sale) => {
    if (sale.client !== "Efectivo") {
      creditAmount += sale.total;
    }
  });

  // Calculate total amount from sales that are cash
  let cashAmount = 0;
  sales.forEach((sale) => {
    if (sale.client === "Efectivo") {
      cashAmount += sale.total;
    }
  });

  let debt = 0;

  // Render the inventory page
  res.render("inventory", {
    startDate: startDate,
    endDate: endDate,
    sales: sales,
    creditAmount: creditAmount,
    cashAmount: cashAmount,
    clients: clients,
    debt: debt,
  });
});

module.exports = router;
