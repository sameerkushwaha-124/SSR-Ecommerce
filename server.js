const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const expressSession = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");

dotenv.config();

const app = express();
const connectDB = require("./config/mongoose-connection");
connectDB();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.EXPRESS_SESSION_SECRET,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
  next();
});

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", require("./routes/userIndexRouter"));
app.use("/owners", require("./routes/ownersRouter"));
app.use("/users", require("./routes/usersRouter"));
app.use("/products", require("./routes/productsRouter"));

// Error handling
app.use((err, req, res, next) => {
  res.status(500).render('error', { message: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).render('404', { url: req.originalUrl });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
