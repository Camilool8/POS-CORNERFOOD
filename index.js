const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const app = express();
dotenv.config();

const port = process.env.PORT || 3000;

// Connect to DB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
  })
  .catch((error) => console.log(error));

// Initialize App

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("view engine", "ejs");

const indexRoutes = require("./routes/index");
const dashboardRoutes = require("./routes/dashboard");
const clientsRoutes = require("./routes/clients");
const productsRoutes = require("./routes/products");
const salesRoutes = require("./routes/sales");
const inventoryRoutes = require("./routes/inventory");

app.use("/", indexRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/clients", clientsRoutes);
app.use("/products", productsRoutes);
app.use("/sales", salesRoutes);
app.use("/inventory", inventoryRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
