const mongoose = require("mongoose");
const Decimal128 = mongoose.Types.Decimal128;

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true }, // уникален идентификатор в URL
    author: { type: String, required: true },
    price: {
      type: Decimal128,
      required: true,
      get: (v) => parseFloat(v.toString()),
      set: (v) => Decimal128.fromString(parseFloat(v).toFixed(2)),
    },
    image: { type: String, required: true },
    shortDescription: { type: String, required: true }, // Short description
    fullDescription: { type: String, required: true }, // Full description
    reviews: [{ type: String, required: true }], // Array of review strings
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

module.exports = mongoose.model("Product", productSchema);
