const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const review = require("./review.js");

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: { url: String, filename: String },
  price: Number,
  location: String,
  country: String,
  latitude: Number,
  longitude: Number,
  category: {
    type: String,
    enum: [
      "Treehouses",
      "Houseboats",
      "Domes",
      "Yurts",
      "Castles",
      "Windmills",
      "Earth houses",
      "A-frames",
      "Containers"
    ],
    required: false
  },
  review: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  owner: { type: Schema.Types.ObjectId, ref: "User" }
});

// cleanup reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await review.deleteMany({ _id: { $in: listing.review } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);
