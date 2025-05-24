const mongoose = require('mongoose');

const cakeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  flavor: { type: String, required: true },
  available: { type: Boolean, default: true },
  stock: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['Birthday', 'Wedding', 'Custom', 'Cupcake'], default: 'Birthday' }
}, { timestamps: true });

module.exports = mongoose.model('Cake', cakeSchema);
