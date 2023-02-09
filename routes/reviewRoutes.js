const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const bookingController = require('../controllers/bookingController');

//Creo router
const router = express.Router({ mergeParams: true });

//Proteggo con middleware tutte le reviews
router.use(authController.protectRoute);

//Creo routes reviews
router
  .route('/')
  .get(reviewController.getReviews)
  .post(bookingController.hasUserBooked, reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.patchReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
