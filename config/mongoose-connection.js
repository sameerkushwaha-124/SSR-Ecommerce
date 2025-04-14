const mongoose = require("mongoose");
const debug = require("debug")("development:mongoose");

const mongoURI = "mongodb+srv://sameer:sameer1234@cluster0.bls00ji.mongodb.net/E_COMMERCE?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoURI)
  .then(() => {
    debug("connected to database");
  })
  .catch((err) => {
    debug("error in connecting to database : " + err.message);
  });

module.exports = mongoose.connection;
