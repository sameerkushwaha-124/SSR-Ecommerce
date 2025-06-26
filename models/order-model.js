const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    selectedColor: {
        type: String
    },
    selectedSize: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'razorpay'],
        default: 'cod'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    deliveredDate: {
        type: Date
    },
    trackingNumber: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('order', orderSchema);
