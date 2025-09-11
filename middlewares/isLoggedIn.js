const userModel = require('../models/users-model');
const ownerModel = require('../models/owner-model');
const jwt = require('jsonwebtoken');

module.exports.isLoggedInUser = async (req, res, next) => {
  try {
    if (!req.cookies.userToken) throw new Error("No token");
    
    const decoded = jwt.verify(req.cookies.userToken, process.env.JWT_KEY);
    const user = await userModel.findOne({ email: decoded.email }).select("-password");
    
    if (!user) throw new Error("User not found");
    
    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("userToken");
    req.flash("error", "Please login");
    res.redirect('/');
  }
};

module.exports.isLoggedInAdmin = async (req, res, next) => {
  try {
    if (!req.cookies.ownerToken) throw new Error("No token");
    
    const decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);
    const owner = await ownerModel.findOne({ email: decoded.email }).select("-password");
    
    if (!owner) throw new Error("Owner not found");
    
    req.owner = owner;
    next();
  } catch (err) {
    res.clearCookie("ownerToken");
    req.flash("error", "Please login");
    res.redirect('/owners');
  }
};
