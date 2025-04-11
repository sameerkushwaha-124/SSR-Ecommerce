const express = require('express');
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const router = express.Router();

router.get('/', (req, res) => {
  let error = req.flash('error');
  res.render('index',{error});
});




router.get('/shop', isLoggedIn, (req, res) => {
  const products = [
    {
      id: 1,
      name: "Classic White Tee",
      price: 799,
      discount: 10,
      bgcolor: "#ffffff",
      panelcolor: "#000000",
      textcolor: "#ffffff",
      description: "Premium quality cotton t-shirt",
      image: Buffer.from("white-tshirt-image-data").toString('base64')
    },
    {
      id: 2,
      name: "Black Jeans",
      price: 1499,
      discount: 15,
      bgcolor: "#f5f5f5",
      panelcolor: "#333333",
      textcolor: "#ffffff",
      description: "Slim fit black denim jeans",
      image: Buffer.from("black-jeans-image-data").toString('base64')
    }
  ];
  res.render('shop', {
    title: 'Shop',
    products: products,
    user: req.user
  });
});


module.exports = router;