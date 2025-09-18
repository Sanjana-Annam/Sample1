const express = require("express");
const router = express.Router();
const wrapAsync = require("../util/wrapAsync.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingControl = require("../controller/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudinary.js");   // ✅ FIXED
const upload = multer({ storage });
const Listing = require("../models/listing"); 

// New listing form
router.route("/")
    .get(wrapAsync(listingControl.AllListings))
    .post(isLoggedIn, upload.single('listing[image]'), wrapAsync(listingControl.newPost));
    
router.get("/new", isLoggedIn, (req, res) => {
    const { id } = req.params;
    const list = Listing.findById(id);
    res.render("listings/new.ejs", {list});
});

// Show a single listing
router.route("/:id")
    .get(wrapAsync(listingControl.showListing))
    .put(isLoggedIn, isOwner,upload.single('listing[image]'), wrapAsync(listingControl.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingControl.destroyListing));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingControl.editListing));

module.exports = router;
