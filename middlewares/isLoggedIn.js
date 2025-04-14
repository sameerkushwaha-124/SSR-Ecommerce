const userModel = require('../models/users-model');
const ownerModel = require('../models/owner-model');
const jwt = require('jsonwebtoken');

module.exports.isLoggedInUser = async function(req, res, next){
    if(!req.cookies.userToken){
        req.flash("error", "You need to Login first!");
        return res.redirect('/');
    }

    try{
        let decoded = jwt.verify(req.cookies.userToken, process.env.JWT_KEY);
        let user = await userModel.findOne({ email: decoded.email }).select("-password");
        req.user = user;
        next();
    } catch(err){
        req.flash("error", "Something went wrong");
        console.log("error in isLoggedInUser")
        res.redirect('/');
    }
}

module.exports.isLoggedInAdmin = async function(req, res, next){
    if(!req.cookies.ownerToken){
        req.flash("error", "You need to Login first!");
        return res.redirect('/owners');
    }

    try{
        let decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);
        let owner = await ownerModel.findOne({ email: decoded.email }).select("-password");
        req.owner = owner;
        next();
    } catch(err){
        req.flash("error", "Something went wrong");
        res.redirect('/owner');
    }
}
