const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const perfumeSchema = new Schema(
  {
    perfumeName: { type: String, required: true },
    uri: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    concentration: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Perfume = mongoose.model("Perfume", perfumeSchema);

module.exports = Perfume;
