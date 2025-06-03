const mongoose = require("mongoose");
const Decimal128 = mongoose.Types.Decimal128;

const purchaseSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productTitle: { type: String, required: true },
    productPrice: {
      type: Decimal128,
      required: true,
      get: (v) => parseFloat(v.toString()),
      set: (v) => Decimal128.fromString(parseFloat(v).toFixed(2)),
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Decimal128,
      required: true,
      get: (v) => parseFloat(v.toString()),
      set: (v) => Decimal128.fromString(parseFloat(v).toFixed(2)),
    },
    customer: {
      username: { type: String, required: true },
      email: { type: String },
      password: { type: String },
    },
    address: {
      type: String,
      required: true,
    },
    date: { type: Date, default: Date.now, required: true },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
