const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const perfumeSchema = new Schema(
  {
    perfumeName: { type: String, required: true },
    uri: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    concentration: { type: String, required: true }, //nồng độ của nước hoa: Extrait, EDP, EDT,…
    description: { type: String, require: true },
    ingredients: { type: String, require: true },
    volume: { type: Number, require: true },
    targetAudience: { type: String, require: true }, // male, femail, unisex
    comments: [commentSchema],
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brands",
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const Perfume = mongoose.model("Perfume", perfumeSchema);

module.exports = Perfume;
