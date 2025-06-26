const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
    name:{
       type:String,
    } ,
    image:{
        type:Buffer
    },
    price:{
        type:Number
    },
    role:{
        type:String,
        required:true,
        default:"product"
    },
    
    discount:{
        type:Number,
        default:0
    },
    panelcolor:{
        type:String
    },
    bgcolor:{
        type:String
    },
    textcolor:{
        type:String
    },
    description:{
        type:String
    },
    category:{
        type:String,
        default:"other"
    }
}, {
    timestamps: true // This adds createdAt and updatedAt fields
})

module.exports = mongoose.model('product',productsSchema);