const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: String,
  image: Buffer,
  price: Number,
  discount: { type: Number, default: 0 },
  description: String,
  category: { type: String, default: "other" },
  panelcolor: String,
  bgcolor: String,
  textcolor: String
}, { timestamps: true });

module.exports = mongoose.model('product', productSchema);
