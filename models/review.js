const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: { createdAt: 'created_At' } // ✅ placed correctly as schema option
});

module.exports = mongoose.model("Review", reviewSchema);
