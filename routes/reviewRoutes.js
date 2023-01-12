const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

//Creo router
const router = express.Router();

//Creo routes reviews
router
  .route('/')
  .get(reviewController.getReviews)
  .post(authController.protectRoute, reviewController.createReview);

router
  .route('/:id')
  .get(
    authController.protectRoute,
    authController.restrictTo('admin', 'guide'),
    reviewController.getReview
  )
  .patch(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    reviewController.patchReview
  )
  .delete(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    reviewController.deleteReview
  );

module.exports = router;
