const Listing = require("./models/listing");
const Review = require("./models/review");
const {reviewSchema} = require("./schema.js");
module.exports.isValidate = (req, res, next) => {
    let { error }= reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError (400, errMsg);
    } else {
        next();
    }
};

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;

    }
    next();
}

module.exports.isOwner = async(req,res,next) => {
    let {id} = req.params;
    let foundlisting = await Listing.findById(id);
    if(!(foundlisting && foundlisting.owner.equals(res.locals.currUser._id))){
        req.flash("error", "Your are not the owner of this listing");
        return res.redirect(`/listing/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req,res,next) => {
    let {id, reviewId} = req.params;
    let foundReview = await Review.findById(reviewId);
    if(!(foundReview && foundReview.author.equals(res.locals.currUser._id))){
        req.flash("error", "Your are not the author of this review");
        return res.redirect(`/listing/${id}`);
    }
    next();
}