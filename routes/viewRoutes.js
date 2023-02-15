const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const tourController = require('../controllers/tourController');

const router = express.Router();

//Middlewares per rendering pages
router.get(
  '/',
  //Se c'è stato un checkout, creo il booking
  bookingController.createBookingAfterCheckout,
  tourController.checkTourParticipants,
  authController.isLoggedIn,
  viewController.getOverview
);

router.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewController.getTourDetails
);

router.get('/login', authController.isLoggedIn, viewController.login);

router.get('/sign-up', authController.isLoggedIn, viewController.signUp);

router.get('/me', authController.protectRoute, viewController.account);

router.get(
  '/me/my-bookings',
  authController.protectRoute,
  viewController.myBookings
);

router.get(
  '/me/my-reviews',
  authController.protectRoute,
  viewController.myReviews
);

router.get(
  '/me/manage-tours',
  authController.protectRoute,
  authController.restrictTo('admin'),
  viewController.adminManageTours
);

module.exports = router;
