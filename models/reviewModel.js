const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty"],
      maxLength: [100, "The review can't exceed 100 characters."],
    },
    rating: {
      type: Number,
      min: [1, 'Review must be equal or more than 1.'],
      max: [5, 'Review must be equal or less than 5.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    // tour: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'Tour',
    //   required: [true, 'Review must belong to a tour.'],
    // },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Query Middleware per popolare users
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'name',
  }).populate({
    path: 'user',
    select: 'username photo -_id',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
