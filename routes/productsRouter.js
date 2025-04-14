const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const productModel = require('../models/products-model');
const { isLoggedInAdmin } = require('../middlewares/isLoggedIn');

router.post('/create', isLoggedInAdmin , upload.single("image") , async (req,res)=>{
    try{
        let {name, image, price, discount, panelcolor, bgcolor, textcolor, description} = req.body;
        let createdProduct = await productModel.create({
            image : req.file.buffer,
            name : name,
            price : price,
            discount : discount,
            panelcolor : panelcolor,
            bgcolor : bgcolor,
            textcolor : textcolor,
            description : description,
        })
        req.flash("success", "Product created successfully");
        res.redirect('owners/create-products'); 
    }catch(err){
        res.send(err.message);
    }
    
})

module.exports = router;