const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../util/wrapAsync.js");
const {isLoggedIn, isReviewAuthor, isValidate} = require("../middleware.js");
const reviewControl = require("../controller/reviews.js");


//review post route
router.post("/", isLoggedIn, isValidate, wrapAsync(reviewControl.createReview));

router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(reviewControl.destroyReview));

module.exports = router;