const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, minlength: 6 },
    googleId: { type: String, unique: true, sparse: true },
    phoneNumber: { type: String },
    address: { type: String },
    profileImage: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // ✅ جديد: المفضلات
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cake" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
