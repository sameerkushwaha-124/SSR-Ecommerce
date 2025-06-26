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

        // Add timeout to database query
        const user = await Promise.race([
            userModel.findOne({ email: decoded.email }).select("-password"),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database query timeout')), 8000)
            )
        ]);

        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;
        next();
    } catch (err) {
        // Clear the token if there's an authentication error
        res.clearCookie("userToken");

        if (err.message.includes('timeout') || err.message.includes('buffering')) {
            req.flash("error", "Connection issue. Please try again.");
        } else {
            req.flash("error", "Authentication failed. Please login again.");
        }

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

        // Add timeout to database query
        const owner = await Promise.race([
            ownerModel.findOne({ email: decoded.email }).select("-password"),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database query timeout')), 8000)
            )
        ]);

        if (!owner) {
            throw new Error("Owner not found");
        }

        req.owner = owner;
        next();
    } catch (err) {
        // Clear the token if there's an authentication error
        res.clearCookie("ownerToken");

        if (err.message.includes('timeout') || err.message.includes('buffering')) {
            req.flash("error", "Connection issue. Please try again.");
        } else {
            req.flash("error", "Authentication failed. Please login again.");
        }

        if (process.env.NODE_ENV !== "production") {
            console.error("Error in isLoggedInAdmin:", err.message);
        }
        res.redirect('/owners');
    }
};
