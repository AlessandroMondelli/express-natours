const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

//Middlewares per rendering pages
router.get('/', authController.isLoggedIn, viewController.getOverview);

router.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewController.getTourDetails
);

router.get('/login', authController.isLoggedIn, viewController.login);

router.get('/me', authController.protectRoute, viewController.account);

module.exports = router;
