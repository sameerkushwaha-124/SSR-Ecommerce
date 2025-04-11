const express = require('express');
const router = express.Router();
const {registerUser} = require('../controllers/authController');
const {loginUser} = require('../controllers/authController');
const {logout} = require('../controllers/authController');

router.get('/',(req,res)=>{
    res.send("This is the users Routes");
});

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/logout', logout);

module.exports = router;