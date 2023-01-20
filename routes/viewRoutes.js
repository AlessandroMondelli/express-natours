const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

//Middlewares per rendering pages
router.get('/', viewController.getOverview);

router.get('/tour/:slug', viewController.getTourDetails);

module.exports = router;
