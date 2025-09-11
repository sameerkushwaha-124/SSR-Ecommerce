const express = require('express');
const jwt = require('jsonwebtoken');
const { isLoggedInUser } = require('../middlewares/isLoggedIn');
const productsModel = require('../models/products-model');
const router = express.Router();
const userModel = require('../models/users-model');
const { getUserProfile, updateUserProfile, changePassword, getOrderHistory, searchUserData } = require('../controllers/userProfileController');
const razorpay = require('../config/razorpay-config');
const crypto = require('crypto');

router.get('/', async (req, res) => {
  // Check if user is already logged in
  if (req.cookies.userToken) {
    try {
      const decoded = jwt.verify(req.cookies.userToken, process.env.JWT_KEY);
      const user = await userModel.findOne({ email: decoded.email }).select("-password");

      if (user) {
        // User is logged in, redirect to shop
        return res.redirect("/shop");
      }
    } catch (err) {
      // Invalid token, clear it and continue to login page
      res.clearCookie("userToken");
    }
  }

  // Show login/register page for non-logged-in users
  res.render('userIndex', {loggedIn:false});
});

router.get('/shop', async (req, res) => {
  try {
    const { search, sortby } = req.query;
    let query = {};
    let sortOptions = {};

    // Search functionality
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Sort functionality
    if (sortby === 'newest') {
      sortOptions.createdAt = -1;
    } else if (sortby === 'price-low') {
      sortOptions.price = 1;
    } else if (sortby === 'price-high') {
      sortOptions.price = -1;
    } else {
      // Default to popular (you can customize this logic)
      sortOptions.createdAt = -1;
    }

    let products = await productsModel.find(query).sort(sortOptions);

    // Check if user is logged in
    let user = null;
    if (req.cookies.userToken) {
      try {
        const decoded = jwt.verify(req.cookies.userToken, process.env.JWT_KEY);
        user = await userModel.findOne({ email: decoded.email }).select("-password");
      } catch (err) {
        // Invalid token, clear it
        res.clearCookie("userToken");
      }
    }

    res.render('shop', {
      products,
      searchQuery: search || '',
      currentSort: sortby || 'popular',
      user,
      loggedIn: !!user
    });
  } catch (error) {
    res.render('shop', {
      products: [],
      searchQuery: '',
      currentSort: 'popular',
      user: null,
      loggedIn: false,
      error: 'Failed to load products'
    });
  }
});
router.get('/addtocart/:productId',isLoggedInUser ,async(req,res)=>{
  try {
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
      req.flash('success', 'Item quantity updated in cart!');
    }else{
      user.cart.push({product : req.params.productId, quantity : 1});
      req.flash('success', 'Item added to cart successfully!');
    }
    await user.save();

    res.redirect('/shop');
  } catch (error) {

    req.flash('error', 'Failed to add item to cart');
    res.redirect('/shop');
  }
})
// Add From Cart (AJAX)
router.post('/cart/add/:productId', isLoggedInUser, async (req, res) => {
  try {
    const user = await userModel.findOne({email : req.user.email});
    let index = -1;
    let object = user.cart.find((item,idx)=>{
      if(item.product == req.params.productId){
        index = idx;
        return item;
      }
    });

    if (object) {
      user.cart[index].quantity +=1;
      await user.save();
      res.json({
        success: true,
        message: 'Item quantity increased!',
        newQuantity: user.cart[index].quantity
      });
    } else {
      res.json({ success: false, message: 'Item not found in cart' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Failed to update cart' });
  }
});

// Legacy route for backward compatibility
router.get('/cart/add/:productId', isLoggedInUser, async (req, res) => {
  try {
    const user = await userModel.findOne({email : req.user.email});
    let index = -1;
    let object = user.cart.find((item,idx)=>{
      if(item.product == req.params.productId){
        index = idx;
        return item;
      }
    });

    if (object) {
      user.cart[index].quantity +=1;
      await user.save();
      req.flash('success', 'Item quantity increased!');
    } else {
      req.flash('error', 'Item not found in cart');
    }

    res.redirect('/cart');
  } catch (error) {
    req.flash('error', 'Failed to update cart');
    res.redirect('/cart');
  }
});

// Remove from cart (AJAX)
router.post('/cart/remove/:productId', isLoggedInUser, async (req, res) => {
  try {
    const user = await userModel.findOne({email : req.user.email});
    let index = -1;
    let object = user.cart.find((item,idx)=>{
      if(item.product == req.params.productId){
        index = idx;
        return item;
      }
    });

    if (object) {
      if(user.cart[index].quantity > 1){
        user.cart[index].quantity -=1;
        await user.save();
        res.json({
          success: true,
          message: 'Item quantity decreased!',
          newQuantity: user.cart[index].quantity,
          action: 'decreased'
        });
      }else{
        user.cart.splice(index,1);
        await user.save();
        res.json({
          success: true,
          message: 'Item removed from cart!',
          newQuantity: 0,
          action: 'removed'
        });
      }
    } else {
      res.json({ success: false, message: 'Item not found in cart' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Failed to update cart' });
  }
});

// Remove from cart (Legacy - for backward compatibility)
router.get('/cart/remove/:productId', isLoggedInUser, async (req, res) => {
  try {
    const user = await userModel.findOne({email : req.user.email});
    let index = -1;
    let object = user.cart.find((item,idx)=>{
      if(item.product == req.params.productId){
        index = idx;
        return item;
      }
    });

    if (object) {
      if(user.cart[index].quantity > 1){
        user.cart[index].quantity -=1;
        req.flash('success', 'Item quantity decreased!');
      }else{
        user.cart.splice(index,1);
        req.flash('success', 'Item removed from cart!');
      }
      await user.save();
    } else {
      req.flash('error', 'Item not found in cart');
    }

    res.redirect('/cart');
  } catch (error) {
    req.flash('error', 'Failed to update cart');
    res.redirect('/cart');
  }
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
    if(process.env.NODE_ENV !== "production") 
    req.flash('error', 'Failed to load your cart');
    res.redirect('/');
  }
});

// Remove all items of a specific product from cart
router.get('/cart/remove-all/:productId', isLoggedInUser, async (req, res) => {
  try {
    const user = await userModel.findOne({email : req.user.email});
    user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
    await user.save();
    req.flash('success', 'Item removed from cart!');
    res.redirect('/cart');
  } catch (error) {
    req.flash('error', 'Failed to remove item from cart');
    res.redirect('/cart');
  }
});

// Cart count API
router.get('/api/cart/count', isLoggedInUser, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) {
      return res.json({ success: false, count: 0 });
    }

    // Calculate total quantity of items in cart
    const totalItems = user.cart.reduce((total, item) => total + item.quantity, 0);

    res.json({
      success: true,
      count: totalItems,
      uniqueItems: user.cart.length
    });
  } catch (error) {
    res.json({ success: false, count: 0 });
  }
});

// Product Detail Route - Public access
router.get('/product/:id', async (req, res) => {
  try {
    const product = await productsModel.findById(req.params.id);
    if (!product) {
      return res.redirect('/shop');
    }

    // Check if user is logged in
    let user = null;
    if (req.cookies.userToken) {
      try {
        const decoded = jwt.verify(req.cookies.userToken, process.env.JWT_KEY);
        user = await userModel.findOne({ email: decoded.email }).select("-password");
      } catch (err) {
        // Invalid token, clear it
        res.clearCookie("userToken");
      }
    }

    res.render('product-detail', { product, user, loggedIn: !!user });
  } catch (error) {
    res.redirect('/shop');
  }
});

// Logout Route
router.get('/logout', (req, res) => {
  res.clearCookie('userToken');
  req.flash('success', 'Logged out successfully');
  res.redirect('/');
});

// Profile Routes
router.get('/account', isLoggedInUser, getUserProfile);
router.post('/account/update', isLoggedInUser, updateUserProfile);
router.post('/account/change-password', isLoggedInUser, changePassword);
router.get('/account/orders', isLoggedInUser, async (req, res) => {
  try {
    const orderModel = require('../models/order-model');
    const orders = await orderModel.find({ user: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 });

    // Convert product images from Buffer to base64 and create clean objects
    const cleanOrders = orders.map((order) => {
      const orderObj = order.toObject();

      if (orderObj.product && orderObj.product.image) {
        try {
          orderObj.product.imageUrl = `data:image/jpeg;base64,${orderObj.product.image.toString('base64')}`;
          // Remove the original buffer to avoid JSON serialization issues
          delete orderObj.product.image;
        } catch (imageError) {
          res.json({
            success: false, message: 'Failed to process product image'
          })
        }
      }

      return orderObj;
    });

    res.json({ success: true, orders: cleanOrders });
  } catch (error) {
    res.json({ success: false, message: 'Failed to fetch orders' });
  }
});
router.get('/account/search', isLoggedInUser, searchUserData);

// Account Management Routes
router.post('/account/deactivate', isLoggedInUser, async (req, res) => {
  try {
    const userModel = require('../models/users-model');
    await userModel.findByIdAndUpdate(req.user._id, {
      isActive: false,
      inactiveSince: new Date()
    });
    req.flash('success', 'Account deactivated successfully');
    res.json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Failed to deactivate account' });
  }
});

router.post('/account/activate', isLoggedInUser, async (req, res) => {
  try {
    const userModel = require('../models/users-model');
    await userModel.findByIdAndUpdate(req.user._id, {
      isActive: true,
      $unset: { inactiveSince: 1 }  // Remove the inactiveSince field when activating
    });
    req.flash('success', 'Account activated successfully');
    res.json({ success: true, message: 'Account activated successfully' });
  } catch (error) {

    res.json({ success: false, message: 'Failed to activate account' });
  }
});

// Buy Now - Direct Checkout Route
router.post('/buy-now', isLoggedInUser, async (req, res) => {
  try {
    const { productId, selectedColor, selectedSize, quantity = 1 } = req.body;
    const productsModel = require('../models/products-model');

    // Validate input
    if (!productId) {
      return res.json({ success: false, message: 'Product ID is required' });
    }

    // Get product details
    const product = await productsModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: 'Product not found' });
    }

    // Create checkout session data with minimal product info
    const checkoutItem = {
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      selectedColor: selectedColor || product.colors?.[0],
      selectedSize: selectedSize || product.sizes?.[0],
      quantity: parseInt(quantity),
      price: product.price,
      total: product.price * parseInt(quantity)
    };

    // Store in session for checkout
    req.session.buyNowItem = checkoutItem;

    // Force session save to ensure it's persisted
    req.session.save((err) => {
      if (err) {
        return res.json({ success: false, message: 'Failed to save session data' });
      }

      if (process.env.NODE_ENV !== "production") {
        console.log('Buy now session saved:', checkoutItem);
      }

      res.json({
        success: true,
        message: 'Redirecting to checkout...',
        redirectUrl: `/checkout?product=${productId}&qty=${quantity}&color=${encodeURIComponent(selectedColor || '')}&size=${encodeURIComponent(selectedSize || '')}`
      });
    });

  } catch (error) {
    console.error('Buy now error:', error);
    res.json({ success: false, message: 'Failed to process buy now request' });
  }
});

// Checkout Page Route
router.get('/checkout', isLoggedInUser, async (req, res) => {
  try {
    let checkoutItem = req.session.buyNowItem;

    if (process.env.NODE_ENV !== "production") {
      console.log('Checkout session data:', checkoutItem);
      console.log('Session ID:', req.sessionID);
      console.log('URL params:', req.query);
    }

    // Fallback: If session data is missing, try to reconstruct from URL parameters
    if (!checkoutItem && req.query.product) {
      const productsModel = require('../models/products-model');
      const product = await productsModel.findById(req.query.product);

      if (product) {
        checkoutItem = {
          productId: product._id,
          productName: product.name,
          productPrice: product.price,
          selectedColor: req.query.color || product.colors?.[0],
          selectedSize: req.query.size || product.sizes?.[0],
          quantity: parseInt(req.query.qty) || 1,
          price: product.price,
          total: product.price * (parseInt(req.query.qty) || 1)
        };

        // Save to session for future use
        req.session.buyNowItem = checkoutItem;
      }
    }

    if (!checkoutItem) {
      req.flash('error', 'No item selected for checkout. Please try the buy now process again.');
      return res.redirect('/shop');
    }

    // Fetch fresh product data with image
    const productsModel = require('../models/products-model');
    const product = await productsModel.findById(checkoutItem.productId);

    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/shop');
    }

    // Convert product image to base64
    const productObj = product.toObject();
    if (productObj.image) {
      productObj.imageUrl = `data:image/jpeg;base64,${productObj.image.toString('base64')}`;
    }

    // Create complete checkout item with fresh product data
    const completeCheckoutItem = {
      ...checkoutItem,
      product: productObj
    };

    res.render('checkout', {
      user: req.user,
      item: completeCheckoutItem,
      loggedIn: true
    });
  } catch (error) {
    console.error('Checkout page error:', error);
    req.flash('error', 'Failed to load checkout page');
    res.redirect('/shop');
  }
});

// Place Order Route
router.post('/place-order', isLoggedInUser, async (req, res) => {
  try {
    const { fullName, phone, address, paymentMethod } = req.body;
    const checkoutItem = req.session.buyNowItem;

    if (!checkoutItem) {
      return res.json({ success: false, message: 'No item selected for checkout' });
    }

    // Validate required fields
    if (!fullName || !phone || !address) {
      return res.json({ success: false, message: 'All shipping details are required' });
    }

    // Only allow COD for now
    if (paymentMethod !== 'cod') {
      return res.json({ success: false, message: 'Only Cash on Delivery is available currently' });
    }

    const orderModel = require('../models/order-model');

    // Generate tracking number
    const trackingNumber = 'TRK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Create order
    const newOrder = new orderModel({
      user: req.user._id,
      product: checkoutItem.productId,
      quantity: checkoutItem.quantity,
      selectedColor: checkoutItem.selectedColor,
      selectedSize: checkoutItem.selectedSize,
      price: checkoutItem.price,
      total: checkoutItem.total,
      shippingAddress: {
        fullName: fullName,
        phone: phone,
        address: address
      },
      paymentMethod: paymentMethod,
      orderStatus: 'confirmed',
      paymentStatus: 'pending',
      trackingNumber: trackingNumber
    });

    await newOrder.save();

    // Clear checkout session
    delete req.session.buyNowItem;

    res.json({
      success: true,
      message: 'Order placed successfully!',
      orderId: newOrder._id,
      trackingNumber: trackingNumber
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.json({ success: false, message: 'Failed to place order' });
  }
});

router.post('/account/delete', isLoggedInUser, async (req, res) => {
  try {
    const { password } = req.body;
    const bcrypt = require('bcrypt');
    const userModel = require('../models/users-model');

    // Verify user password
    if (!password) {
      return res.json({ success: false, message: 'Password is required to delete account' });
    }

    // Get the full user data including password
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: 'Invalid password' });
    }

    // Delete the user account
    const deletedUser = await userModel.findByIdAndDelete(req.user._id);
    if (!deletedUser) {
      return res.json({ success: false, message: 'Failed to delete account' });
    }

    // Clear the session
    res.clearCookie('userToken');
    req.flash('success', 'Account deleted successfully');
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.json({ success: false, message: 'Failed to delete account' });
  }
});

router.post('/create-razorpay-order', isLoggedInUser, async (req, res) => {
    try {
        const checkoutItem = req.session.buyNowItem;
        
        if (!checkoutItem) {
            return res.json({ success: false, message: 'No item selected for checkout' });
        }

        const options = {
            amount: checkoutItem.total * 100, // Amount in paise
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                productId: checkoutItem.productId,
                userId: req.user._id.toString(),
                quantity: checkoutItem.quantity
            }
        };

        const order = await razorpay.orders.create(options);
        
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.json({ success: false, message: 'Failed to create payment order' });
    }
});

// Verify Razorpay Payment
router.post('/verify-razorpay-payment', isLoggedInUser, async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            fullName,
            phone,
            address
        } = req.body;

        const checkoutItem = req.session.buyNowItem;
        
        if (!checkoutItem) {
            return res.json({ success: false, message: 'No item selected for checkout' });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.json({ success: false, message: 'Payment verification failed' });
        }

        // Create order in database
        const orderModel = require('../models/order-model');
        const trackingNumber = 'TRK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

        const newOrder = new orderModel({
            user: req.user._id,
            product: checkoutItem.productId,
            quantity: checkoutItem.quantity,
            selectedColor: checkoutItem.selectedColor,
            selectedSize: checkoutItem.selectedSize,
            price: checkoutItem.price,
            total: checkoutItem.total,
            shippingAddress: {
                fullName: fullName,
                phone: phone,
                address: address
            },
            paymentMethod: 'razorpay',
            orderStatus: 'confirmed',
            paymentStatus: 'paid',
            trackingNumber: trackingNumber,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        await newOrder.save();

        // Clear checkout session
        delete req.session.buyNowItem;

        res.json({
            success: true,
            message: 'Payment successful! Order placed.',
            orderId: newOrder._id,
            trackingNumber: trackingNumber
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.json({ success: false, message: 'Payment verification failed' });
    }
});
module.exports = router;