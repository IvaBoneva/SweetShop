const express = require("express");
const router = express.Router();

const Product = require("../models/Product");

router.post("/review/:id", async (req, res) => {
  const { id } = req.params;
  const { comments } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).send("Продуктът не е намерен");

    product.reviews.push(comments);
    await product.save();

    res.redirect(`/product/${product.slug}`);
  } catch (err) {
    console.error("Грешка при добавяне на ревю:", err);
    res.status(500).send("Грешка при добавяне на ревю");
  }
});

module.exports = router;
