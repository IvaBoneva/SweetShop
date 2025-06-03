const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Purchase = require("../models/Purchase");

router.post("/purchase/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Продукт не е намерен");

    const quantity = parseInt(req.body.quantity, 10);
    const address = req.body.address;

    let customer;

    if (req.session.user) {
      customer = {
        username: req.session.user.username,
        email: req.session.user.email,
        password: req.session.user.password, // хеширана
      };
    } else {
      customer = {
        username: req.body.name || "Гост",
        email: "няма",
        password: "няма",
      };
    }

    const unitPrice = parseFloat(product.price);
    const totalPrice = unitPrice * quantity;

    await Purchase.create({
      product: product._id,
      productTitle: product.title,
      productPrice: unitPrice,
      quantity: quantity,
      price: totalPrice,
      customer: customer,
      address: address,
    });

    await Product.findByIdAndUpdate(product._id, {
      $inc: { purchaseCount: quantity },
    });

    res.redirect(`/product/${product.slug}`);
  } catch (err) {
    console.error("Грешка при поръчка:", err);
    res.status(500).send("Грешка при поръчка");
  }
});

module.exports = router;
