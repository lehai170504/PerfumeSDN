// models/Perfume.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
require("./Comment");

const perfumeSchema = new Schema(
  {
    perfumeName: {
      type: String,
      required: true,
      unique: true,
    },
    uri: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    concentration: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: { type: String, required: true },
    volume: { type: Number, required: true },
    targetAudience: { type: String, required: true },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
  },
  { timestamps: true }
);

const Perfume = mongoose.model("Perfume", perfumeSchema);
module.exports = Perfume;
