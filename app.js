if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./util/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// MongoDB connection
const dburl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("✅ Database connected");
    })
    .catch((err) => {
        console.log("❌ Database connection error:", err);
    });

async function main() {
    await mongoose.connect(dburl);
}

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodoverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session + Mongo store
const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600,
});
store.on("error", (err) => {
    console.log("❌ ERROR in mongo session:", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Test route to create a fake user
app.get("/userTest", async (req, res) => {
    let fakeUser = new User({
        email: "Sanjanaannam87@gmail.com",
        username: "Sanju",
    });
    let registeredUser = await User.register(fakeUser, "Sanjana@91");
    res.send(registeredUser);
});

// Routes
const listingRoute = require("./routes/listingRoute.js");
const reviewRoute = require("./routes/reviewRoute.js");
const userRoute = require("./routes/userRoute.js");

app.use("/listing", listingRoute);
app.use("/listing/:id/review", reviewRoute);
app.use("/", userRoute);

// ✅ Root route (fix for Render 404 on /)
app.get("/", (req, res) => {
    // Redirect to listings
    res.redirect("/listing");

    // OR render homepage:
    // res.render("home");
});

// 404 handler
app.all("*", (req, res, next) => {
    console.error("404 for URL:", req.originalUrl);
    next(new ExpressError(404, `Page not found: ${req.originalUrl}`));
});

// Error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    if (!err.message) err.message = message;
    if (!err.status) err.status = statusCode;

    res.status(statusCode).render("listings/err.ejs", { error: err });
});

// Server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
