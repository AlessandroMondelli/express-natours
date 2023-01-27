const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get(
  '/checkout/:tourId',
  authController.protectRoute,
  // authController.restrictTo('user'),
  bookingController.getCheckoutSession
);

module.exports = router;
