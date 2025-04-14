const express = require('express');
const { isLoggedInUser } = require('../middlewares/isLoggedIn');
const productsModel = require('../models/products-model');
const router = express.Router();
const userModel = require('../models/users-model');

router.get('/', (req, res) => {
  let error = req.flash('error');
  res.render('userIndex',{error, loggedIn:false});
});

router.get('/shop', isLoggedInUser,  async (req, res) => {
  let products =  await productsModel.find();
  res.render('shop',{products});
});
router.get('/addtocart/:productId',isLoggedInUser ,async(req,res)=>{
  const user = await userModel.findOne({email : req.user.email});
  let index = -1;
  let object = user.cart.find((item,idx)=>{
    if(item.product == req.params.productId){
      index = idx; 
      return item;
    }
  })
  if(object){
    user.cart[index].quantity +=1;
  }else{
    user.cart.push({product : req.params.productId, quantity : 1});
  }
  await user.save();
  
  res.redirect('/shop');
})
// Add From Cart
router.get('/cart/add/:productId', isLoggedInUser, async (req, res) => {
  const user = await userModel.findOne({email : req.user.email});
  let index = -1;
  let object = user.cart.find((item,idx)=>{
    if(item.product == req.params.productId){
      index = idx; 
      return item;
    }
  });
  
  user.cart[index].quantity +=1;
  
  await user.save();
  res.redirect('/cart')
});

// Remove from cart
router.get('/cart/remove/:productId', isLoggedInUser, async (req, res) => {
  const user = await userModel.findOne({email : req.user.email});
  let index = -1;
  let object = user.cart.find((item,idx)=>{
    if(item.product == req.params.productId){
      index = idx; 
      return item;
    }
  });
  if(user.cart[index].quantity > 1){
    user.cart[index].quantity -=1;
  }else{
    user.cart.splice(index,1);
  }
  await user.save();
  res.redirect('/cart')
});

router.get('/cart', isLoggedInUser, async(req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email })
      .populate({
        path: 'cart.product',
        // This ensures we still get cart items even if product was deleted
        options: { 
          allowNull: true, 
          defaults: { 
            name: 'Deleted Product',
            price: 0,
            discount: 0,
            panelcolor: '#f3f4f6',
            bgcolor: '#ffffff',
            textcolor: '#000000'
          }
        }
      });
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/login');
    }

    // Filter out null products (if needed) or handle in template
    const validCartItems = user.cart.filter(item => item.product !== null);
    
    // Optional: Clean up cart by removing deleted products
    if (validCartItems.length < user.cart.length) {
      user.cart = validCartItems;
      await user.save();
    }

    res.render('cart', {
      cart: validCartItems,
      // Or pass the original cart and handle nulls in template:
      // cart: user.cart
    });
    
  } catch (error) {
    console.error('Cart error:', error);
    req.flash('error', 'Failed to load your cart');
    res.redirect('/');
  }
});

module.exports = router;