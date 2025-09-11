const userModel = require('../models/users-model');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/generateToken');

module.exports.registerUser = async (req, res) => {
  try {
    const { email, password, fullname } = req.body;
    
    if (await userModel.findOne({ email })) {
      req.flash("error", "User already exists");
      return res.redirect('/');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ email, password: hashedPassword, fullname });
    
    res.cookie("userToken", generateToken(user));
    req.flash("success", "Registration successful!");
    res.redirect('/shop');
  } catch (err) {
    req.flash("error", "Registration failed");
    res.redirect('/');
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      req.flash("error", "Invalid credentials");
      return res.redirect('/');
    }

    res.cookie('userToken', generateToken(user));
    res.redirect('/shop');
  } catch (err) {
    req.flash("error", "Login failed");
    res.redirect('/');
  }
};

module.exports.logout = (req, res) => {
  res.clearCookie('userToken');
  req.flash("success", "Logged out");
  res.redirect('/');
};
