const mongoose = require('mongoose');
const debug = require('debug')("development:mongoose");
const config = require('config'); 


mongoose.connect(`${config.get("MONGODB_URI")}/SSR-EcommerceDB`)
.then(()=>{
    debug("connected to database");
})
.catch((err)=>{
    debug("error in connecting to database : " + err);
})


module.exports = mongoose.connection;