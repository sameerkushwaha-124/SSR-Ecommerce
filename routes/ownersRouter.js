const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const bcrypt = require('bcrypt');
const {generateToken} = require('../utils/generateToken');
const { isLoggedInAdmin } = require("../middlewares/isLoggedIn");


// This route is only available for development phase.

router.get('/', (req, res)=>{
   res.render('ownerIndex',{loggedIn:false});
})

if (process.env.NODE_ENV === "development") {
  router.post("/create", async (req, res) => {
    let owners = await ownerModel.find();
    if (owners.length > 0) {
      return res
        .status(503)
        .send("You don't have permission to create new owner!");
    }
    let {fullname, email, password} = req.body;
    console.log(fullname, email, password);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let createdOwner = await ownerModel.create({
        fullname:fullname,
        email:email,
        password:hashedPassword,       
    });

    const ownerToken = generateToken(createdOwner);
    res.cookie('ownerToken',ownerToken);
    res.status(201).send(createdOwner);
  });
}



if (process.env.NODE_ENV === "development") {
  router.post("/login", async (req, res) => {
   
  
    let {email, password} = req.body;

    let owner = await ownerModel.findOne({email:email});

    if(!owner){
      // res.flash("Email Or Password is incorrect");
      res.redirect('/owners');
    }
    bcrypt.compare(password, owner.password, (err, result)=>{
      if(result === true){
          let ownerToken = generateToken(owner);
         
          res.cookie('ownerToken',ownerToken);
          res.render('owner-page');
      }else{
          return res.status(401).send("Email Or Password is incorrect");
      }
  });
  });
}

router.get('/logout',(req,res)=>{
  res.clearCookie('ownerToken');
  res.redirect('/owners');
})

router.get("/create-products", isLoggedInAdmin,   (req, res) => {
  let success = req.flash("success");
  res.render("createproducts",{success}); 
});

module.exports = router;
