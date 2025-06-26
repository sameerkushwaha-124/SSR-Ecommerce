// config/mongoose-connection.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Set mongoose options for better connection handling
    mongoose.set('strictQuery', false);

    // Add connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("🔧 Possible solutions:");
    console.log("1. Check your internet connection");
    console.log("2. Verify MongoDB Atlas IP whitelist includes your IP: 157.49.49.46");
    console.log("3. Check if MONGODB_URI is correct in your .env file");
    console.log("4. Visit: https://cloud.mongodb.com/ to manage your cluster");

    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      console.log("⚠️  Continuing in development mode without database...");
    }
  }
};

module.exports = connectDB;
