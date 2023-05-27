const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  category: String,
  description: String,
  image: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
