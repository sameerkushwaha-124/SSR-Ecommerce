const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    minLength: 3,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
  password: {
    type: String,
    required: true,
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product"
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  orders: {
    type: Array,
    default: [],
  },
  contact: {
    type: String,
    trim: true,
  },
  picture: {
    type: String,
    default: null,
  },
  address: {
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: "India",
    }
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true,
    },
    notifications: {
      type: Boolean,
      default: true,
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true, // This adds createdAt and updatedAt fields
});

module.exports = mongoose.model("user", userSchema);
