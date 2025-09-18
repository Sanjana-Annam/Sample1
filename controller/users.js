const User = require("../models/user.js");
module.exports.signupPage = (req,res)=>{
    res.render("users/signup.ejs")
}
module.exports.signup = async(req,res)=>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listing");
        });
        
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }

}
module.exports.loginPage = (req,res)=>{
    res.render("users/login.ejs");
}

module.exports.login = async(req, res)=>{
    req.flash("success", "Welcome back to wanderlust");
    let redirect = res.locals.redirectUrl || "/listing";
    res.redirect(redirect);
}

module.exports.logout = (req,res)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Logged out successfully");
        res.redirect("/listing");
    })
}



