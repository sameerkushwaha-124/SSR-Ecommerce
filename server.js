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
  // console.log(req.flash('success'));
  res.locals.success = req.flash("success");
  console.log(res.locals.success);
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

console.log(process.env.NODE_ENV);
// Route to handle form submission
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`Server running on http://localhost:${PORT}`);
  }
});
