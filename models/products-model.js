const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
    name:{
       type:String,

    } ,
    image:{
        type:String
    },
    price:{
        type:Number
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
    }
})

module.exports = mongoose.model('product',productsSchema);