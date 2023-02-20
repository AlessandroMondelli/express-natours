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
  '/me/my-bookmarks',
  authController.protectRoute,
  viewController.myBookmarks
);

router.get(
  '/me/manage-tours',
  authController.protectRoute,
  authController.restrictTo('admin'),
  viewController.adminManage
);

router.get(
  '/me/manage-tours/create',
  authController.protectRoute,
  authController.restrictTo('admin'),
  viewController.adminCreateTour
);

router.get(
  '/me/manage-tours/edit/:tourId',
  authController.protectRoute,
  authController.restrictTo('admin'),
  viewController.adminEditTour
);

router.get(
  '/me/manage-users',
  authController.protectRoute,
  authController.restrictTo('admin'),
  viewController.adminManage
);

router.get(
  '/me/manage-users/create',
  authController.protectRoute,
  authController.restrictTo('admin'),
  viewController.adminCreateUser
);

router.get(
  '/me/manage-users/edit/:userId',
  authController.protectRoute,
  authController.restrictTo('admin'),
  viewController.adminEditUser
);

router.get(
  '/me/manage-reviews',
  authController.protectRoute,
  authController.restrictTo('admin'),
  viewController.adminManage
);

router.get(
  '/me/manage-bookings',
  authController.protectRoute,
  authController.restrictTo('admin'),
  viewController.adminManage
);

module.exports = router;
