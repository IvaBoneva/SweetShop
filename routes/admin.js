const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Purchase = require("../models/Purchase"); // Добавям този модел

router.get("/", async (req, res) => {
  try {
    let purchases = await Purchase.find().populate("product");

    // Филтрирам само валидни поръчки с наличен продукт
    purchases = purchases.filter((p) => p.product);

    const products = await Product.find();

    const purchaseCounts = {};
    purchases.forEach((p) => {
      const id = p.product._id.toString();
      purchaseCounts[id] = (purchaseCounts[id] || 0) + p.quantity;
    });

    const enrichedProducts = products.map((product) => {
      const id = product._id.toString();
      const purchaseCount = purchaseCounts[id] || 0;
      return { ...product.toObject(), purchaseCount };
    });

    res.render("admin", {
      purchases,
      products: enrichedProducts,
    });
  } catch (err) {
    console.error("Грешка при зареждане на админ панела:", err);
    res.status(500).send("Грешка при зареждане на админ панела.");
  }
});

// DELETE: Изтриване на продукт и свързаните с него поръчки
router.delete("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // 1. Изтривам продукта
    await Product.findByIdAndDelete(productId);

    // 2. Изтривам поръчките, които съдържат този продукт
    await Purchase.deleteMany({ product: productId });

    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send("Грешка при изтриване на продукта и свързаните поръчки");
  }
});

router.post("/products", async (req, res) => {
  try {
    const {
      title,
      slug,
      author,
      price,
      image,
      shortDescription,
      fullDescription,
      reviews,
    } = req.body;

    const newProduct = new Product({
      title,
      slug,
      author,
      price,
      image,
      shortDescription,
      fullDescription,
      reviews: Array.isArray(reviews) ? reviews : [reviews],
    });

    await newProduct.save();
    res.redirect("/admin");
  } catch (err) {
    console.error("Грешка при създаване на продукт:", err);
    res.status(500).send("Грешка при създаване на продукт.");
  }
});

// GET: Показване на формата за редактиране
router.get("/products/:id/edit", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Продуктът не е намерен");

    res.render("edit-product", { product });
  } catch (err) {
    console.error("Грешка при зареждане на формата за редакция:", err);
    res.status(500).send("Грешка при зареждане на формата за редакция");
  }
});

// PUT: Записване на редактираните данни
router.put("/products/:id", async (req, res) => {
  try {
    const {
      title,
      slug,
      author,
      price,
      image,
      shortDescription,
      fullDescription,
      reviews,
    } = req.body;

    const updatedProduct = {
      title,
      slug,
      author,
      price,
      image,
      shortDescription,
      fullDescription,
      reviews: Array.isArray(reviews) ? reviews : [reviews],
    };

    // Тук се обновява документа в MongoDB по ID
    await Product.findByIdAndUpdate(req.params.id, updatedProduct);
    res.redirect("/admin");
  } catch (err) {
    console.error("Грешка при редакция на продукт:", err);
    res.status(500).send("Грешка при редакция на продукт");
  }
});

module.exports = router;
