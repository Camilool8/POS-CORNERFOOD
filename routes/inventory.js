const express = require("express");
const router = express.Router();
const Sale = require("../models/sale");

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

  // Calculate total amount from sales
  let totalAmount = sales.reduce((total, sale) => total + sale.total, 0);

  // Render the inventory page
  res.render("inventory", {
    startDate: startDate,
    endDate: endDate,
    sales: sales,
    totalAmount: totalAmount,
  });
});

module.exports = router;
