const userModel = require('../models/users-model');
const jwt = require('jsonwebtoken');

module.exports.isLoggedIn = async function(req, res, next){
    if(!req.cookies.token){
        req.flash("error", "You need to Login first!");
        return res.redirect('/');
    }

    try{
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        let user = await userModel.findOne({ email: decoded.email }).select("-password");
        req.user = user;
        next();
    } catch(err){
        req.flash("error", "Something went wrong");
        res.redirect('/');
    }
}
