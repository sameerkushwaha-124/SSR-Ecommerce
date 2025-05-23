const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");
const { isLoggedInAdmin } = require("../middlewares/isLoggedIn");

// GET: Owner login page
router.get("/", (req, res) => {
  const error = req.flash("error");
  res.render("ownerIndex", { loggedIn: false, error });
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
      return res.redirect("/owners/create-products");
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
  const success = req.flash("success");
  res.render("createproducts", { success });
});

module.exports = router;
