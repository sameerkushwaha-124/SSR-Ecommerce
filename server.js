const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const expressSession = require("express-session");
const flash = require("connect-flash");
dotenv.config();

const connectDB = require("./config/mongoose-connection");
connectDB(); // call it

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === "production", // works with HTTPS only
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

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
