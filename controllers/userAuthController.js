const userModel = require('../models/users-model');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/generateToken');

// Register User
module.exports.registerUser = async function (req, res) {
    try {
        const { email, password, fullname } = req.body;

        // Validate input
        if (!email || !password || !fullname) {
            req.flash("error", "All fields are required.");
            return res.redirect('/');
        }

        if (password.length < 6) {
            req.flash("error", "Password must be at least 6 characters long.");
            return res.redirect('/');
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            req.flash("error", "User already exists. Please login.");
            return res.redirect('/');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const createdUser = await userModel.create({
            email,
            password: hashedPassword,
            fullname
        });

        const userToken = generateToken(createdUser);
        res.cookie("userToken", userToken);
        req.flash("success", "Registration successful! Welcome to Velora!");
        return res.redirect('/shop');
    } catch (err) {
        console.error("Registration Error:", err.message);

        // Handle specific MongoDB errors
        if (err.name === 'ValidationError') {
            req.flash("error", "Please check your input and try again.");
        } else if (err.code === 11000) {
            req.flash("error", "Email already exists. Please use a different email.");
        } else if (err.message.includes('MongooseServerSelectionError')) {
            req.flash("error", "Database connection error. Please try again later.");
        } else {
            req.flash("error", "Registration failed. Please try again.");
        }
        return res.redirect('/');
    }
};

// Login User
module.exports.loginUser = async function (req, res) {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            req.flash("error", "Email or password is incorrect");
            return res.redirect('/');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash("error", "Email or password is incorrect");
            return res.redirect('/');
        }

        // Update last login
        await userModel.findOneAndUpdate(
            { email: user.email },
            { lastLogin: new Date() }
        );

        const userToken = generateToken(user);
        res.cookie('userToken', userToken);
        return res.redirect('/shop');
    } catch (err) {
        console.error("Login Error:", err.message);
        req.flash("error", "Login failed. Try again.");
        return res.redirect('/');
    }
};

// Logout User
module.exports.logout = function (req, res) {
    res.clearCookie('userToken');
    req.flash("success", "Logged out successfully.");
    res.redirect('/');
};
