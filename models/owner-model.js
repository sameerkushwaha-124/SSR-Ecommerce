const mongoose = require('mongoose');

const ownerSchema = mongoose.Schema({
    fullname:{
        type:String,
        minLength:3,
        trim:true
    },
    role:{
        type:String,
        required:true,
        default:"owner"
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    products:{
        type:Array,
        default:[]
    },
    picture:{
        type:String
    },
    gtn:{
        type:String
    }
})

module.exports = mongoose.model('owner',ownerSchema);