const Review = require('../models/reviewModel');
const asyncErrCheck = require('../utils/asyncErr');
const AppError = require('../utils/appError');

exports.getReviews = asyncErrCheck(async (req, res, next) => {
  const reviews = await Review.find();

  if (!reviews) {
    return next(new AppError('Reviews not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReview = asyncErrCheck(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.createReview = asyncErrCheck(async (req, res) => {
  req.body.user = req.user.id;
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.patchReview = asyncErrCheck(async (req, res, next) => {
  const patchedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!patchedReview) {
    return next(new AppError(`Review ${req.params.id} not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: patchedReview,
    },
  });
});

exports.deleteReview = asyncErrCheck(async (req, res, next) => {
  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    message: 'Review deleted successfully',
  });
});
