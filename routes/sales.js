const express = require("express");
const router = express.Router();
const Client = require("../models/client");
const Sale = require("../models/sale");
const Product = require("../models/product");
const moment = require("moment-timezone");

router.get("/question", (req, res) => {
  res.render("question");
});

router.get("/cash", async (req, res) => {
  try {
    // Retrieve just products from the database
    const products = await Product.find();

    let display = "none";

    res.render("salescash", { products, display });
  } catch (error) {
    // Handle any errors that occur
    console.error(error);
  }
});

router.get("/credit", async (req, res) => {
  try {
    // Retrieve clients and products from the database
    const clients = await Client.find();
    const products = await Product.find();

    let display = "none";
    let message = "";

    res.render("salescredit", {
      clients,
      products,
      display,
      errorMessage: message,
    });
  } catch (error) {
    // Handle any errors that occur
    console.error(error);
  }
});

router.post("/checkout", async (req, res) => {
  const clientid = req.body.client;
  const totalAmount = parseInt(req.body.totalAmount);
  const products = req.body.selectedProducts;

  // Check if client and selectedProducts are present
  if (!clientid || !products) {
    const clients = await Client.find();
    const products = await Product.find();
    const display = "block";
    const message = "Debe elegir un cliente y al menos un producto";

    return res.render("salescredit", {
      clients,
      products,
      display,
      errorMessage: message,
    });
  }

  try {
    const Dbproducts = [];
    const Dbquantities = [];
    const jsonproducts = JSON.parse(products);

    for (const product of jsonproducts) {
      const productID = product.productId;
      const productQuantity = product.quantity;

      // Retrieve the product from the database
      const productData = await Product.findById(productID);

      if (productData) {
        // Add the product to the array
        Dbproducts.push(productData);
        Dbquantities.push(productQuantity);
      } else {
        throw new Error("Product not found");
      }
    }

    // Retrieve the client from the database
    const clientdebt = await Client.findById(clientid);

    if (!clientdebt) {
      throw new Error("Client not found");
    } else if (
      clientdebt.limit > 0 &&
      clientdebt.debt + totalAmount > clientdebt.limit
    ) {
      const clients = await Client.find();
      const products = await Product.find();
      const display = "block";
      const message = `El cliente no puede exceder su límite de crédito. Al cliente ${
        clientdebt.name
      } le quedan ${clientdebt.limit - clientdebt.debt} para gastar.`;

      return res.render("salescredit", {
        clients,
        products,
        display,
        errorMessage: message,
      });
    }

    const clientname = clientdebt.name;

    // if client debt is undefined
    if (clientdebt.debt == undefined) {
      clientdebt.debt = 0;
    }

    // Update the client debt
    clientdebt.debt += totalAmount;

    // Create a new sale
    const newSale = new Sale({
      client: clientname,
      products: Dbproducts,
      quantity: Dbquantities,
      total: totalAmount,
      date: moment().tz("America/Santo_Domingo").toDate(),
    });

    // Save the sale and client
    await Promise.all([newSale.save(), clientdebt.save()]);

    // Redirect to the dashboard
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);

    const clients = await Client.find();
    const products = await Product.find();
    const display = "block";
    const message = "Ha ocurrido un error";

    res.render("salescredit", {
      clients,
      products,
      display,
      errorMessage: message,
    });
  }
});

router.post("/checkout/cash", async (req, res) => {
  const totalAmount = parseInt(req.body.totalAmount);
  const products = req.body.selectedProducts;

  // Check if selectedProducts are present
  if (!products) {
    const products = await Product.find();
    const display = "block";

    return res.render("salescash", { products, display });
  }

  try {
    const Dbproducts = [];
    const Dbquantities = [];
    const jsonproducts = JSON.parse(products);

    for (const product of jsonproducts) {
      const productID = product.productId;
      const productQuantity = product.quantity;

      // Retrieve the product from the database
      const productData = await Product.findById(productID);

      if (productData) {
        // Add the product to the array
        Dbproducts.push(productData);
        Dbquantities.push(productQuantity);
      } else {
        throw new Error("Product not found");
      }
    }

    // Create a new sale
    const newSale = new Sale({
      client: "Efectivo",
      products: Dbproducts,
      quantity: Dbquantities,
      total: totalAmount,
      date: moment().tz("America/Santo_Domingo").toDate(),
    });

    // Save the sale
    await newSale.save();

    // Redirect to the dashboard
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);

    const products = await Product.find();
    const display = "block";

    res.render("salescash", { products, display });
  }
});

router.get("/details/:id", async (req, res) => {
  const id = req.params.id;

  await Sale.findById(id)
    .populate("products")
    .then((sale) => {
      res.render("salesdetail", { sale: sale });
    });
});

router.get("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Retrieve the sale from the database, subtract the debt from the client and delete the sale
    const sale = await Sale.findById(id);

    if (!sale) {
      throw new Error("Sale not found");
    } else {
      // Retrieve the client from the database
      await Client.findOne({ name: sale.client }).then((client) => {
        if (!client) {
          sale.deleteOne().catch(() => {
            throw new Error("Client not found, debt not subtracted");
          });
        } else {
          // Subtract the debt from the client
          client.debt -= sale.total;

          // Save the client
          client.save().catch(() => {
            throw new Error("Client not found, debt not subtracted");
          });
        }
      });

      // Delete the sale
      await sale.deleteOne();
    }

    // Redirect to the dashboard
    res.redirect("/dashboard");
  } catch (error) {
    // Handle any errors
    console.error(error);
  }
});

module.exports = router;
