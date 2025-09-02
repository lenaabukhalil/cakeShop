const mongoose = require("mongoose");
const cakeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    flavor: { type: String, required: true },
    available: { type: Boolean, default: true },
    imageUrl: { type: String },
    ratings: [{ type: Number, min: 1, max: 5 }],
    customizable: { type: Boolean, default: false },
    stock: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["Birthday", "Wedding", "Custom", "Cupcake", "Cupcakes", "Cookies", "Cheesecakes", "Holiday", "Pastries"],
      default: "Birthday",
    },
    ingredients: [String],
    createdAt: { type: Date, default: Date.now },
    baker: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model("Cake", cakeSchema);
