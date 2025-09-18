if(process.env.NODE_ENV != "production"){
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
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


// const mongoose_url = 'mongodb://127.0.0.1:27017/wanderrest';
const dburl = process.env.ATLASDB_URL;

const listingRoute = require("./routes/listingRoute.js");
const reviewRoute = require("./routes/reviewRoute.js");
const userRoute = require("./routes/userRoute.js");


main()
    .then((res)=>{
        console.log("databae connected");
    })
    .catch((err)=>{
        console.log(err)
    })

async function main(){
    await mongoose.connect(dburl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodoverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto:{
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600,
})
store.on("error", (err)=>{
    console.log("ERROR in mongo session",err);
})
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/userTest", async (req,res)=>{
    let fakeUser = new User({
        email: "Sanjanaannam87@gmail.com",
        username: "Sanju"
    })
    let registeredUser = await User.register(fakeUser, "Sanjana@91");
    res.send(registeredUser);
})

app.use("/listing", listingRoute);
app.use("/listing/:id/review", reviewRoute);
app.use("/", userRoute);

app.all('*',(req,res,next)=>{
    console.error("404 for URL:", req.originalUrl);
    next(new ExpressError(404, `Page not found: ${req.originalUrl}`));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;

    // Ensure the error has a message and status for rendering
    if (!err.message) err.message = message;
    if (!err.status) err.status = statusCode;

    res.status(statusCode).render('listings/err.ejs', { error: err });
});

app.listen(8080, ()=>{
    console.log("server is listening at port 8080")
})