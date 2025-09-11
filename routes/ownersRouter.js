const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
const { isLoggedInAdmin } = require("../middlewares/isLoggedIn");

// Login page
router.get("/", async (req, res) => {
  if (req.cookies.ownerToken) {
    try {
      const decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);
      const owner = await ownerModel.findOne({ email: decoded.email });
      if (owner) return res.redirect("/owners/dashboard");
    } catch (err) {
      res.clearCookie("ownerToken");
    }
  }
  res.render("ownerIndex", { loggedIn: false });
});

// Create owner
router.post("/create", async (req, res) => {
  try {
    const owners = await ownerModel.find();
    if (owners.length > 0) return res.status(403).send("Owner already exists!");

    const { fullname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const owner = await ownerModel.create({ fullname, email, password: hashedPassword });
    
    res.cookie("ownerToken", generateToken(owner));
    res.status(201).send(owner);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await ownerModel.findOne({ email });
    
    if (!owner || !await bcrypt.compare(password, owner.password)) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/owners");
    }

    res.cookie("ownerToken", generateToken(owner));
    res.redirect("/owners/dashboard");
  } catch (err) {
    req.flash("error", "Login failed");
    res.redirect("/owners");
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("ownerToken");
  res.redirect("/owners");
});

// Create products page
router.get("/create-products", isLoggedInAdmin, (req, res) => {
  res.render("createproducts");
});

// Dashboard
router.get("/dashboard", isLoggedInAdmin, async (req, res) => {
  try {
    const productsModel = require("../models/products-model");
    const userModel = require("../models/users-model");
    const orderModel = require("../models/order-model");

    const [totalProducts, totalUsers, totalOrders, revenueResult, recentProducts] = await Promise.all([
      productsModel.countDocuments(),
      userModel.countDocuments(),
      orderModel.countDocuments(),
      orderModel.aggregate([
        { $match: { orderStatus: 'delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
      ]),
      productsModel.find().sort({ createdAt: -1 }).limit(5)
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.render("owner-dashboard", {
      totalProducts, totalUsers, totalOrders, totalRevenue, recentProducts
    });
  } catch (error) {
    req.flash("error", "Failed to load dashboard");
    res.redirect("/owners");
  }
});

// Products management
router.get("/products", isLoggedInAdmin, async (req, res) => {
  try {
    const productsModel = require("../models/products-model");
    const { search, sortby } = req.query;
    
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      name: { name: 1 }
    }[sortby] || { createdAt: -1 };

    const products = await productsModel.find(query).sort(sortOptions);
    res.render("products-management", {
      products,
      searchQuery: search || '',
      currentSort: sortby || 'newest'
    });
  } catch (error) {
    req.flash("error", "Failed to load products");
    res.redirect("/owners/dashboard");
  }
});

// Delete product
router.post("/products/delete/:id", isLoggedInAdmin, async (req, res) => {
  try {
    await require("../models/products-model").findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.json({ success: false, message: "Delete failed" });
  }
});

// Profile
router.get("/profile", isLoggedInAdmin, (req, res) => {
  res.render("owner-profile", { owner: req.owner });
});

router.post("/profile/update", isLoggedInAdmin, async (req, res) => {
  try {
    const { fullname, email } = req.body;
    await ownerModel.findByIdAndUpdate(req.owner._id, { fullname, email });
    req.flash("success", "Profile updated");
    res.redirect("/owners/profile");
  } catch (error) {
    req.flash("error", "Update failed");
    res.redirect("/owners/profile");
  }
});

// Users management
router.get("/users", isLoggedInAdmin, async (req, res) => {
  try {
    const userModel = require("../models/users-model");
    const { search, sortby } = req.query;
    
    const query = search ? {
      $or: [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name: { fullname: 1 },
      email: { email: 1 }
    }[sortby] || { createdAt: -1 };

    const users = await userModel.find(query).select("-password").sort(sortOptions);
    res.render("users-management", {
      users,
      searchQuery: search || '',
      currentSort: sortby || 'newest'
    });
  } catch (error) {
    req.flash("error", "Failed to load users");
    res.redirect("/owners/dashboard");
  }
});

// View user
router.get("/users/:id", isLoggedInAdmin, async (req, res) => {
  try {
    const user = await require("../models/users-model").findById(req.params.id).select("-password");
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/owners/users");
    }
    res.render("user-profile-view", { user });
  } catch (error) {
    req.flash("error", "Failed to load user");
    res.redirect("/owners/users");
  }
});

// Orders management
router.get("/orders", isLoggedInAdmin, async (req, res) => {
  try {
    const orders = await require('../models/order-model').find()
      .populate('user', 'fullname email')
      .populate('product')
      .sort({ createdAt: -1 });

    orders.forEach(order => {
      if (order.product?.image) {
        order.product.imageUrl = `data:image/jpeg;base64,${order.product.image.toString('base64')}`;
      }
    });

    res.render("orders-management", { owner: req.owner, orders, loggedIn: true });
  } catch (error) {
    req.flash('error', 'Failed to fetch orders');
    res.redirect('/owners/dashboard');
  }
});

// Update order status
router.post("/orders/update-status/:id", isLoggedInAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const orderModel = require('../models/order-model');
    const order = await orderModel.findById(req.params.id);
    
    if (!order) return res.json({ success: false, message: 'Order not found' });

    order.orderStatus = status;
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
      order.deliveredDate = new Date();
      await ownerModel.findByIdAndUpdate(req.owner._id, { $inc: { totalEarnings: order.total } });
    }

    await order.save();
    res.json({ success: true, message: `Order ${status}`, newStatus: status });
  } catch (error) {
    res.json({ success: false, message: 'Update failed' });
  }
});

// Delete user
router.post("/users/delete/:id", isLoggedInAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.json({ success: false, message: "Password required" });

    const owner = await ownerModel.findById(req.owner._id);
    if (!await bcrypt.compare(password, owner.password)) {
      return res.json({ success: false, message: "Invalid password" });
    }

    await require("../models/users-model").findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.json({ success: false, message: "Delete failed" });
  }
});

module.exports = router;
