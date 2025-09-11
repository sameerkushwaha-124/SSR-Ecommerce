const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  cart: [{ 
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    quantity: { type: Number, default: 1 }
  }],
  orders: { type: Array, default: [] },
  contact: String,
  picture: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: "India" }
  }
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);
