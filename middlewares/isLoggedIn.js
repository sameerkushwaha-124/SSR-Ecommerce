const userModel = require('../models/users-model');
const ownerModel = require('../models/owner-model');
const jwt = require('jsonwebtoken');

module.exports.isLoggedInUser = async function(req, res, next) {
    if (!req.cookies.userToken) {
        req.flash("error", "You need to login first!");
        return res.redirect('/');
    }

    try {
        const decoded = jwt.verify(req.cookies.userToken, process.env.JWT_KEY);
        if (!decoded || !decoded.email) {
            throw new Error("Invalid token");
        }
        const user = await userModel.findOne({ email: decoded.email }).select("-password");
        req.user = user;
        next();
    } catch (err) {
        req.flash("error", "Authentication failed. Please login again.");
        if (process.env.NODE_ENV !== "production") {
            console.error("Error in isLoggedInUser:", err.message);
        }
        res.redirect('/');
    }
};

module.exports.isLoggedInAdmin = async function(req, res, next) {
    if (!req.cookies.ownerToken) {
        req.flash("error", "You need to login first!");
        return res.redirect('/owners');
    }

    try {
        const decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);
        if (!decoded || !decoded.email) {
            throw new Error("Invalid token");
        }
        const owner = await ownerModel.findOne({ email: decoded.email }).select("-password");
        req.owner = owner;
        next();
    } catch (err) {
        req.flash("error", "Authentication failed. Please login again.");
        if (process.env.NODE_ENV !== "production") {
            console.error("Error in isLoggedInAdmin:", err.message);
        }
        res.redirect('/owners');
    }
};
