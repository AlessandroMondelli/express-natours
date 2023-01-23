const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

//Middlewares per rendering pages
router.get('/', viewController.getOverview);

router.get('/tour/:slug', viewController.getTourDetails);

router.get('/login', viewController.login);

module.exports = router;
