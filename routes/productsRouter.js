const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const productModel = require('../models/products-model');
const { isLoggedInAdmin } = require('../middlewares/isLoggedIn');

router.post('/create', isLoggedInAdmin , upload.single("image") , async (req,res)=>{
    try{
        let {name, image, price, discount, panelcolor, bgcolor, textcolor, description, category} = req.body;
        let createdProduct = await productModel.create({
            image : req.file.buffer,
            name : name,
            price : price,
            discount : discount,
            panelcolor : panelcolor,
            bgcolor : bgcolor,
            textcolor : textcolor,
            description : description,
            category : category,
        })
        req.flash("success", "Product created successfully");
        res.redirect("/owners/products");
    }catch(err){
        console.error("Product creation error:", err);
        req.flash("error", "Failed to create product: " + err.message);
        res.redirect("/owners/create-products");
    }

})

// GET: Product statistics for dashboard
router.get('/stats', isLoggedInAdmin, async (req, res) => {
    try {
        const totalProducts = await productModel.countDocuments();
        const recentProducts = await productModel.find().sort({ createdAt: -1 }).limit(5);

        res.json({
            success: true,
            totalProducts,
            recentProducts
        });
    } catch (error) {
        console.error("Product stats error:", error);
        res.json({ success: false, message: "Failed to get product statistics" });
    }
});

// PUT: Update product
router.put('/update/:id', isLoggedInAdmin, upload.single("image"), async (req, res) => {
    try {
        const { name, price, discount, panelcolor, bgcolor, textcolor, description, category } = req.body;
        const updateData = {
            name,
            price,
            discount,
            panelcolor,
            bgcolor,
            textcolor,
            description,
            category
        };

        if (req.file) {
            updateData.image = req.file.buffer;
        }

        await productModel.findByIdAndUpdate(req.params.id, updateData);
        req.flash("success", "Product updated successfully");
        res.json({ success: true, message: "Product updated successfully" });
    } catch (error) {
        console.error("Product update error:", error);
        res.json({ success: false, message: "Failed to update product" });
    }
});

module.exports = router;