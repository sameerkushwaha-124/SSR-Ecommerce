const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const productModel = require('../models/products-model');

router.post('/create', upload.single("image") , async (req,res)=>{
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
        res.redirect('/owners/admin'); 
    }catch(err){
        res.send(err.message);
    }
    
})

module.exports = router;