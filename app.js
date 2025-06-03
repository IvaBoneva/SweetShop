const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");

const Product = require("./models/Product");
const Purchase = require("./models/Purchase");
const User = require("./models/User");

const session = require("express-session");
const bcrypt = require("bcrypt");

const adminRoutes = require("./routes/admin");
const reviewRoutes = require("./routes/reviews");
const purchaseRoutes = require("./routes/purchases");

const methodOverride = require("method-override");
const PORT = 3006;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use("/admin", adminRoutes);
app.use("/", reviewRoutes);
app.use("/", purchaseRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/sweetshopdb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
connectDB();

app.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("index", { products });
  } catch (err) {
    res.status(500).send("Грешка при зареждане на началната страница");
  }
});

app.get("/views/login.ejs", (req, res) => {
  res.render("login");
});

app.get("/views/register.ejs", (req, res) => {
  res.render("register");
});

// Маршрут за продукт по slug
app.get("/product/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).send("Продуктът не е намерен");
    }
    res.render("product", { product });
  } catch (err) {
    res.status(500).send("Грешка на сървъра");
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.send("Този имейл вече е регистриран.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hashedPassword });
  res.redirect("/views/login.ejs");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.send("Невалиден имейл");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.send("Невалидна парола");

  // Проверка дали потребителят е админ
  if (user.email === "iva.kamenova2004@abv.bg") {
    req.session.user = {
      username: user.username,
      email: user.email,
      password: user.password,
      isAdmin: true,
    };
  } else {
    req.session.user = {
      username: user.username,
      email: user.email,
      password: user.password,
      isAdmin: false,
    };
  }

  res.redirect("/");
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});
