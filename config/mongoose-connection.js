const mongoose = require("mongoose");
const debug = require("debug")("development:mongoose");

const mongoURI = process.env.NODE_ENV==='production'?process.env.MONGO_URI: "mongodb://localhost:27017/SSR-EcommerceDB";
mongoose
  .connect(mongoURI)
  .then(() => {
    debug("connected to database");
  })
  .catch((err) => {
    debug("error in connecting to database : " + err.message);
  });

module.exports = mongoose.connection;
