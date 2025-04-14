const express = require('express');
const router = express.Router();
const {registerUser} = require('../controllers/userAuthController');
const {loginUser} = require('../controllers/userAuthController');
const {logout} = require('../controllers/userAuthController');

router.get('/',(req,res)=>{
    res.send("This is the users Routes");
});

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/logout', logout);

module.exports = router;