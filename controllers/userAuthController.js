const userModel = require('../models/users-model');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/generateToken');

// Register User
module.exports.registerUser = async function (req, res) {
    try {
        const { email, password, fullname } = req.body;

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
        return res.redirect('/shop');
    } catch (err) {
        console.error("Registration Error:", err.message);
        req.flash("error", "Something went wrong during registration.");
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
