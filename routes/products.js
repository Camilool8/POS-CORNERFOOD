const express = require("express");
const router = express.Router();
const Product = require("../models/product");

router.get("/", async (req, res) => {
  try {
    // Retrieve the selected category from the query parameters
    const selectedCategory = req.query.category;

    // Query the products collection based on the selected category or retrieve all products if no category is selected
    let products;
    if (selectedCategory) {
      products = await Product.find({ category: selectedCategory });
    } else {
      products = await Product.find();
    }

    // Render the EJS template and pass the products and selected category to the template
    res.render("products", { products, selectedCategory });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/new", (req, res) => {
  res.render("newproduct");
});

router.post("/", async (req, res) => {
  const name = req.body.name;
  const price = req.body.price;
  const quantity = req.body.quantity;
  const category = req.body.category;
  const description = req.body.description;
  const image = req.body.image;

  const newProduct = new Product({
    name,
    price,
    quantity,
    category,
    description,
    image,
  });

  await newProduct.save();
  res.redirect("/products");
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  await Product.findById(id).then((products) => {
    res.render("editproduct", { products: products });
  });
});

router.post("/:id", async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const price = req.body.price;
  const quantity = req.body.quantity;
  const category = req.body.category;
  const description = req.body.description;
  const image = req.body.image;

  await Product.replaceOne(
    { _id: id },
    {
      name,
      price,
      quantity,
      category,
      description,
      image,
    }
  ).then(() => {
    res.redirect("/products");
  });
});

router.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  await Product.findByIdAndDelete(id);
  res.redirect("/products");
});

module.exports = router;
