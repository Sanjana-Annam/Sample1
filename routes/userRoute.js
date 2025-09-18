const express = require("express");
const router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userControl = require("../controller/users.js");

router.route("/signup")
    .get(userControl.signupPage)
    .post(wrapAsync(userControl.signup));

router.route("/login")
    .get(userControl.loginPage)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), userControl.login);

router.get("/logout", (userControl.logout))

module.exports = router;