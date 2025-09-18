const Listing = require("../models/listing");           // Mongoose model
const { listingSchema } = require("../schema.js");     // Joi validation schema
const ExpressError = require("../util/ExpressError.js");
const geocodeAddress = require("../util/geocoding.js");

// Show all listings (with search + category filter)
module.exports.AllListings = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const query = {};

    if (q) {
      query.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
        { location: new RegExp(q, "i") },
        { country: new RegExp(q, "i") },
        { category: new RegExp(q, "i") }  // ✅ include category in search
      ];
    }

    if (category) {
      query.category = category; // ✅ exact category match from pill
    }

    const allListings = await Listing.find(query);
    res.render("listings/index.ejs", { allListings, q, category });
  } catch (err) {
    next(err);
  }
};

// Create new listing
module.exports.newPost = async (req, res, next) => {
  try {
    // Validate input
    const { error } = listingSchema.validate(req.body);
    if (error) throw new ExpressError(400, error);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Handle file upload
    if (req.file) {
      newListing.image = { url: req.file.path, filename: req.file.filename };
    }

    // Ensure location & country exist
    if (!newListing.location || !newListing.country) {
      throw new ExpressError(400, "Location and country are required for geocoding");
    }

    // Geocode the address
    const address = `${newListing.location} ${newListing.country}`.trim();
    const coords = await geocodeAddress(address);

    if (!coords) {
      throw new ExpressError(400, "Unable to fetch coordinates for this address");
    }

    newListing.latitude = coords.lat;
    newListing.longitude = coords.lon;

    await newListing.save();
    req.flash("success", "New listing added successfully");
    res.redirect("/listing");
  } catch (err) {
    next(err);
  }
};

// Show single listing
module.exports.showListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const list = await Listing.findById(id)
      .populate({
        path: "review",
        populate: { path: "author", select: "username" }
      })
      .populate("owner");

    if (!list) {
      req.flash("error", "Listing not found");
      return res.redirect("/listing");
    }

    res.render("listings/show.ejs", { list });
  } catch (err) {
    next(err);
  }
};

// Render edit listing page
module.exports.editListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const list = await Listing.findById(id);

    if (!list) {
      req.flash("error", "Listing not found");
      return res.redirect("/listing");
    }

    let originalimg = list.image?.url;
    if (originalimg) {
      originalimg = originalimg.replace("/upload/", "/upload/w_250,h_50,c_fill/");
    }

    res.render("listings/edit.ejs", { list, originalimg });
  } catch (err) {
    next(err);
  }
};

// Update existing listing
module.exports.updateListing = async (req, res, next) => {
  try {
    console.log("🟡 Update request body:", req.body);
    console.log("🟡 Update request file:", req.file);

    const { id } = req.params;
    const listingDoc = await Listing.findById(id);

    if (!listingDoc) {
      req.flash("error", "Listing not found");
      return res.redirect("/listing");
    }

    // Update only provided fields
    const fields = ["title", "description", "price", "location", "country", "category"]; // ✅ added category
    let locationOrCountryChanged = false;

    fields.forEach(field => {
      if (req.body.listing?.[field]) {
        if (field === "location" || field === "country") locationOrCountryChanged = true;
        listingDoc[field] = req.body.listing[field];
      }
    });

    // Handle file upload
    if (req.file) {
      listingDoc.image = { url: req.file.path, filename: req.file.filename };
    }

    // Re-geocode if location or country changed
    if (locationOrCountryChanged) {
      const address = `${listingDoc.location} ${listingDoc.country}`.trim();
      const coords = await geocodeAddress(address);
      if (coords) {
        listingDoc.latitude = coords.lat;
        listingDoc.longitude = coords.lon;
        console.log("🟢 Updated coords:", coords);
      } else {
        console.log("⚠️ No coordinates found for this address");
      }
    }

    await listingDoc.save();
    req.flash("success", "Listing updated successfully");
    res.redirect(`/listing/${id}`);
  } catch (err) {
    console.error("❌ Update error:", err);
    req.flash("error", "Something went wrong while updating");
    res.redirect("/listing");
  }
};

// Delete listing
module.exports.destroyListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedList = await Listing.findByIdAndDelete(id);

    if (!deletedList) {
      req.flash("error", "Listing not found");
      return res.redirect("/listing");
    }

    req.flash("success", "Listing deleted successfully");
    res.redirect("/listing");
  } catch (err) {
    next(err);
  }
};
