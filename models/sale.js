const mongoose = require("mongoose");
const moment = require("moment-timezone");

const saleSchema = new mongoose.Schema({
  client: String,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  quantity: [Number],
  total: Number,
  isPaid: Boolean,
  date: { type: Date, default: Date.now },
});

saleSchema.pre("save", function (next) {
  const desiredTimezone = "America/Santo_Domingo";

  this.date = moment(this.date).tz(desiredTimezone);
  next();
});

module.exports = mongoose.model("Sale", saleSchema);
