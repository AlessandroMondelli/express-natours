const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(authController.protectRoute);

router.get(
  '/checkout/:tourId',
  // authController.restrictTo('user'),
  bookingController.getCheckoutSession
);

router
  .route('/')
  .get(authController.restrictTo('admin'), bookingController.getBookings)
  .post(bookingController.createBooking);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.patchBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
