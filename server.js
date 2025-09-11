const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const expressSession = require("express-session");
const flash = require("connect-flash");
dotenv.config();

// Try to load MongoStore, fallback to MemoryStore if not available
let MongoStore = null;
try {
  MongoStore = require("connect-mongo");
} catch (error) {
  console.warn("connect-mongo not found, using MemoryStore (not recommended for production)");
}

const connectDB = require("./config/mongoose-connection");
connectDB(); // call it

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Session configuration with MongoDB store for production
const sessionConfig = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.EXPRESS_SESSION_SECRET,
  cookie: {
    secure: process.env.NODE_ENV === "production" && process.env.FORCE_HTTPS === "true",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: process.env.NODE_ENV === "production" ? 'strict' : 'lax',
  },
  name: 'sessionId',
};

// Use MongoDB store in production if available, MemoryStore otherwise
if (process.env.NODE_ENV === "production" && MongoStore) {
  try {
    sessionConfig.store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600, // lazy session update
      crypto: {
        secret: process.env.EXPRESS_SESSION_SECRET
      },
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day in seconds
    });

    // Handle store events
    sessionConfig.store.on('error', (error) => {
      console.error('Session store error:', error);
    });

    sessionConfig.store.on('connected', () => {
      console.log('MongoDB session store connected');
    });

    console.log("✅ Using MongoDB session store for production");
  } catch (error) {
    console.error("❌ Failed to create MongoDB session store:", error);
    console.log("⚠️  Falling back to MemoryStore (not recommended for production)");
  }
} else if (process.env.NODE_ENV === "production" && !MongoStore) {
  console.warn("⚠️  connect-mongo not installed! Using MemoryStore in production (not recommended)");
  console.log("📦 Install with: npm install connect-mongo");
} else {
  console.log("🔧 Using MemoryStore for development");
}

app.use(expressSession(sessionConfig));

app.use(flash());
app.use((req, res, next) => {
  // Make flash messages available to all templates
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.info = req.flash("info");
  res.locals.user = req.user;
  next();
});
// Static files and views
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const userIndexRouter = require("./routes/userIndexRouter");
const usersRouter = require("./routes/usersRouter");
const ownersRouter = require("./routes/ownersRouter");
const productsRouter = require("./routes/productsRouter");

// Routes Middleware
app.use("/", userIndexRouter);
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);


// Production environment check
if(process.env.NODE_ENV === "production") {
  console.log("Running in production mode");
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).render('error', {
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { url: req.originalUrl });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`Local URL: http://localhost:${PORT}`);
  }
});
