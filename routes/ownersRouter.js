const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
const { isLoggedInAdmin } = require("../middlewares/isLoggedIn");

// GET: Owner login page (with redirect for logged-in owners)
router.get("/", async (req, res) => {
  // Check if owner is already logged in
  if (req.cookies.ownerToken) {
    try {
      const decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);
      const owner = await ownerModel.findOne({ email: decoded.email }).select("-password");

      if (owner) {
        // Owner is logged in, redirect to dashboard
        return res.redirect("/owners/dashboard");
      }
    } catch (err) {
      // Invalid token, clear it and continue to login page
      res.clearCookie("ownerToken");
    }
  }

  // Show login page for non-logged-in owners
  res.render("ownerIndex", { loggedIn: false });
});

// POST: Create owner (only in development)
if (process.env.NODE_ENV === "development") {
  router.post("/create", async (req, res) => {
    try {
      let owners = await ownerModel.find();
      if (owners.length > 0) {
        return res
          .status(403)
          .send("Permission denied: Owner already exists!");
      }

      const { fullname, email, password } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const createdOwner = await ownerModel.create({
        fullname,
        email,
        password: hashedPassword,
      });

      const ownerToken = generateToken(createdOwner);
      res.cookie("ownerToken", ownerToken);
      res.status(201).send(createdOwner);
    } catch (err) {
      if(process.env.NODE_ENV !== "production") 
      console.error("Owner creation error:", err.message);
      res.status(500).send("Server Error");
    }
  });
}

// POST: Owner login (only in development)
if (process.env.NODE_ENV === "development") {
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      const owner = await ownerModel.findOne({ email });

      if (!owner) {
        req.flash("error", "Email or password is incorrect");
        return res.redirect("/owners");
      }

      const isMatch = await bcrypt.compare(password, owner.password);

      if (!isMatch) {
        req.flash("error", "Email or password is incorrect");
        return res.redirect("/owners");
      }

      const ownerToken = generateToken(owner);
      res.cookie("ownerToken", ownerToken);
      return res.redirect("/owners/dashboard");
    } catch (err) {
      console.error("Login Error:", err.message);
      req.flash("error", "Something went wrong during login");
      return res.redirect("/owners");
    }
  });
}

// GET: Owner logout
router.get("/logout", (req, res) => {
  res.clearCookie("ownerToken");
  res.redirect("/owners");
});

// GET: Create product page (only for logged-in admins)
router.get("/create-products", isLoggedInAdmin, (req, res) => {
  res.render("createproducts");
});

// GET: Dashboard page
router.get("/dashboard", isLoggedInAdmin, async (req, res) => {
  try {
    const productsModel = require("../models/products-model");
    const userModel = require("../models/users-model");

    const totalProducts = await productsModel.countDocuments();
    const totalUsers = await userModel.countDocuments();
    const recentProducts = await productsModel.find().sort({ createdAt: -1 }).limit(5);

    res.render("owner-dashboard", {
      totalProducts,
      totalUsers,
      recentProducts
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    req.flash("error", "Failed to load dashboard");
    res.redirect("/owners");
  }
});

// GET: Products management page
router.get("/products", isLoggedInAdmin, async (req, res) => {
  try {
    const productsModel = require("../models/products-model");
    const { search, sortby } = req.query;
    let query = {};
    let sortOptions = {};

    // Search functionality
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Sort functionality
    if (sortby === 'newest') {
      sortOptions.createdAt = -1;
    } else if (sortby === 'oldest') {
      sortOptions.createdAt = 1;
    } else if (sortby === 'price-low') {
      sortOptions.price = 1;
    } else if (sortby === 'price-high') {
      sortOptions.price = -1;
    } else if (sortby === 'name') {
      sortOptions.name = 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const products = await productsModel.find(query).sort(sortOptions);

    res.render("products-management", {
      products,
      searchQuery: search || '',
      currentSort: sortby || 'newest'
    });
  } catch (error) {
    console.error("Products management error:", error);
    req.flash("error", "Failed to load products");
    res.redirect("/owners/dashboard");
  }
});

// POST: Delete product
router.post("/products/delete/:id", isLoggedInAdmin, async (req, res) => {
  try {
    const productsModel = require("../models/products-model");
    await productsModel.findByIdAndDelete(req.params.id);
    req.flash("success", "Product deleted successfully");
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.json({ success: false, message: "Failed to delete product" });
  }
});

// GET: Owner profile page
router.get("/profile", isLoggedInAdmin, (req, res) => {
  res.render("owner-profile", { owner: req.owner });
});

// POST: Update owner profile
router.post("/profile/update", isLoggedInAdmin, async (req, res) => {
  try {
    const { fullname, email } = req.body;
    const ownerModel = require("../models/owner-model");

    await ownerModel.findByIdAndUpdate(req.owner._id, {
      fullname,
      email
    });

    req.flash("success", "Profile updated successfully");
    res.redirect("/owners/profile");
  } catch (error) {
    console.error("Profile update error:", error);
    req.flash("error", "Failed to update profile");
    res.redirect("/owners/profile");
  }
});

// GET: Users management page
router.get("/users", isLoggedInAdmin, async (req, res) => {
  try {
    const userModel = require("../models/users-model");
    const { search, sortby } = req.query;
    let query = {};
    let sortOptions = {};

    // Search functionality
    if (search) {
      query = {
        $or: [
          { fullname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Sort functionality
    if (sortby === 'newest') {
      sortOptions.createdAt = -1;
    } else if (sortby === 'oldest') {
      sortOptions.createdAt = 1;
    } else if (sortby === 'name') {
      sortOptions.fullname = 1;
    } else if (sortby === 'email') {
      sortOptions.email = 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const users = await userModel.find(query).select("-password").sort(sortOptions);

    res.render("users-management", {
      users,
      searchQuery: search || '',
      currentSort: sortby || 'newest'
    });
  } catch (error) {
    console.error("Users management error:", error);
    req.flash("error", "Failed to load users");
    res.redirect("/owners/dashboard");
  }
});

// GET: View user profile
router.get("/users/:id", isLoggedInAdmin, async (req, res) => {
  try {
    const userModel = require("../models/users-model");
    const user = await userModel.findById(req.params.id).select("-password");

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/owners/users");
    }

    res.render("user-profile-view", { user });
  } catch (error) {
    console.error("User profile view error:", error);
    req.flash("error", "Failed to load user profile");
    res.redirect("/owners/users");
  }
});

// POST: Delete user
// Orders Management Routes
router.get("/orders", isLoggedInAdmin, async (req, res) => {
  try {
    const orderModel = require('../models/order-model');
    const orders = await orderModel.find()
      .populate('user', 'fullname email')
      .populate('product')
      .sort({ createdAt: -1 });

    // Convert product images from Buffer to base64
    orders.forEach(order => {
      if (order.product && order.product.image) {
        order.product.imageUrl = `data:image/jpeg;base64,${order.product.image.toString('base64')}`;
      }
    });

    res.render("orders-management", {
      owner: req.owner,
      orders: orders,
      loggedIn: true
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    req.flash('error', 'Failed to fetch orders');
    res.redirect('/owners/dashboard');
  }
});

// Update Order Status
router.post("/orders/update-status/:id", isLoggedInAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const orderModel = require('../models/order-model');
    const ownerModel = require('../models/owner-model');

    const order = await orderModel.findById(req.params.id);
    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    // Update order status
    order.orderStatus = status;

    // If marking as delivered, update payment status and add cash to owner
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
      order.deliveredDate = new Date();

      // Add cash to owner account (you can modify this logic as needed)
      await ownerModel.findByIdAndUpdate(req.owner._id, {
        $inc: { totalEarnings: order.total }
      });
    }

    await order.save();

    res.json({
      success: true,
      message: `Order ${status} successfully`,
      newStatus: status
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.json({ success: false, message: 'Failed to update order status' });
  }
});

router.post("/users/delete/:id", isLoggedInAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    const bcrypt = require("bcrypt");
    const userModel = require("../models/users-model");
    const ownerModel = require("../models/owner-model");

    // Verify admin password
    if (!password) {
      return res.json({ success: false, message: "Password is required" });
    }

    // Get the full owner data including password
    const owner = await ownerModel.findById(req.owner._id);
    if (!owner) {
      return res.json({ success: false, message: "Owner not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, owner.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid admin password" });
    }

    // Delete the user
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.json({ success: false, message: "User not found" });
    }

    req.flash("success", "User deleted successfully");
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.json({ success: false, message: "Failed to delete user" });
  }
});

module.exports = router;
