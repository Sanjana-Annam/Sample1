const listing = require("../models/listing");
const review = require("../models/review");
const ExpressError = require("../util/ExpressError.js");
module.exports.createReview = async (req, res) => {
    let list = await listing.findById(req.params.id);
    
    if (!list) {
        throw new ExpressError(404, "Listing not found");
    }

    let newReview = new review({
        rating: req.body.review.rating,
        comment: req.body.review.comment
        
    });
    newReview.author = req.user._id;
    await newReview.save();

// push only the ObjectId
    list.review.push(newReview);

    await list.save();
    req.flash("success", "Review Added Successfully");
    res.redirect(`/listing/${list._id}`);
}

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    // 1. Remove review reference from the listing
    await listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });

    // 2. Delete the review itself
    await review.findByIdAndDelete(reviewId);

    // 3. Redirect back to listing page
    req.flash("success", "Review Deleted Successfully");
    res.redirect(`/listing/${id}`);
}