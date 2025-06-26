const userModel = require('../models/users-model');
const productsModel = require('../models/products-model');
const bcrypt = require('bcrypt');

// Get User Profile
module.exports.getUserProfile = async function (req, res) {
    try {
        const user = await userModel.findOne({ email: req.user.email })
            .populate({
                path: 'orders.products.product',
                model: 'product'
            });
        
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect('/shop');
        }

        res.render('profile', { 
            user: user,
            activeTab: 'profile'
        });
    } catch (err) {
        console.error("Profile Error:", err.message);
        req.flash("error", "Failed to load profile");
        res.redirect('/shop');
    }
};

// Update User Profile
module.exports.updateUserProfile = async function (req, res) {
    try {
        const { fullname, contact, street, city, state, zipCode, country, dateOfBirth, gender } = req.body;
        
        const updateData = {
            fullname: fullname || req.user.fullname,
            contact: contact || req.user.contact,
            address: {
                street: street || '',
                city: city || '',
                state: state || '',
                zipCode: zipCode || '',
                country: country || 'India'
            },
            dateOfBirth: dateOfBirth || req.user.dateOfBirth,
            gender: gender || req.user.gender
        };

        const updatedUser = await userModel.findOneAndUpdate(
            { email: req.user.email },
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            req.flash("error", "Failed to update profile");
            return res.redirect('/account');
        }

        req.flash("success", "Profile updated successfully!");
        res.redirect('/account');
    } catch (err) {
        console.error("Profile Update Error:", err.message);
        req.flash("error", "Failed to update profile");
        res.redirect('/account');
    }
};

// Change Password
module.exports.changePassword = async function (req, res) {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            req.flash("error", "All password fields are required");
            return res.redirect('/account');
        }

        if (newPassword !== confirmPassword) {
            req.flash("error", "New passwords do not match");
            return res.redirect('/account');
        }

        if (newPassword.length < 6) {
            req.flash("error", "New password must be at least 6 characters long");
            return res.redirect('/account');
        }

        const user = await userModel.findOne({ email: req.user.email });
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            req.flash("error", "Current password is incorrect");
            return res.redirect('/account');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userModel.findOneAndUpdate(
            { email: req.user.email },
            { password: hashedPassword }
        );

        req.flash("success", "Password changed successfully!");
        res.redirect('/account');
    } catch (err) {
        console.error("Password Change Error:", err.message);
        req.flash("error", "Failed to change password");
        res.redirect('/account');
    }
};

// Get Order History
module.exports.getOrderHistory = async function (req, res) {
    try {
        const user = await userModel.findOne({ email: req.user.email })
            .populate({
                path: 'orders.products.product',
                model: 'product'
            });

        res.render('profile', { 
            user: user,
            activeTab: 'orders'
        });
    } catch (err) {
        console.error("Order History Error:", err.message);
        req.flash("error", "Failed to load order history");
        res.redirect('/account');
    }
};

// Search Orders and Products
module.exports.searchUserData = async function (req, res) {
    try {
        const { query, type } = req.query;
        const user = await userModel.findOne({ email: req.user.email });
        
        let results = [];

        if (type === 'orders' || !type) {
            // Search in user's orders
            const userWithOrders = await userModel.findOne({ email: req.user.email })
                .populate({
                    path: 'orders.products.product',
                    model: 'product'
                });

            if (userWithOrders && userWithOrders.orders) {
                results = userWithOrders.orders.filter(order => {
                    return order.products.some(item => 
                        item.product && item.product.name.toLowerCase().includes(query.toLowerCase())
                    );
                });
            }
        }

        if (type === 'products' || !type) {
            // Search in all products
            const products = await productsModel.find({
                name: { $regex: query, $options: 'i' }
            }).limit(10);
            
            results = [...results, ...products];
        }

        res.json({
            success: true,
            results: results,
            query: query,
            type: type
        });
    } catch (err) {
        console.error("Search Error:", err.message);
        res.json({
            success: false,
            message: "Search failed"
        });
    }
};
