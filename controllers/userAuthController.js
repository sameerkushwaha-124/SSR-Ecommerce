const userModel = require('../models/users-model');
const bcrypt = require('bcrypt');
const {generateToken} = require('../utils/generateToken');


module.exports.registerUser = async function (req,res){
    try{
        let {email, password, fullname} = req.body;

        let user = await userModel.findOne({email : email});

        if(user){
            return res.status(401).send("User Already Exists, Please Login");
        }
        
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(password, salt, async (err, hash)=>{
                if(err){
                    return res.send(err.message);
                }else{
                    let createdUser = await userModel.create({
                        email : email,
                        password : hash,
                        fullname : fullname
                    });

                    let userToken = generateToken(createdUser);  
                    res.cookie("userToken",userToken);
                    return res.redirect('/shop');
                }
            });
        });       
    }
    catch(err){
        res.send(err.message);
    }
};

module.exports.loginUser = async function(req,res){
    let {email, password} = req.body;

    let user = await userModel.findOne({email:email});

    if(!user){
        res.flash("Email Or Password is incorrect");
        console.log("Email Or Password is incorrect");
        res.redirect('/');
    }
    bcrypt.compare(password, user.password, (err, result)=>{
        if(result === true){
            let userToken = generateToken(user);
            res.cookie('userToken',userToken);
            res.redirect('/shop');
        }else{
            return res.status(401).send("Email Or Password is incorrect");
        }
    });
}

module.exports.logout = function(req,res){
    res.clearCookie('userToken');
    res.redirect('/');
}