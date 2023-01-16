const express = require('express');
const tourController = require('../controllers/tourController'); //Import metodi da controller
const authController = require('../controllers/authController'); //Import metodi auth da controller
const reviewRouter = require('./reviewRoutes'); //Import router review

//Creo router
const router = express.Router();

//Invio richiesta review per tour alla route di review, così che possa ricevere l'id del tour
router.use('/:tourId/reviews', reviewRouter);

//Creo route Alias per recuperare 5 top tours in base a rating e prezzo
router
  .route('/top-5')
  .get(tourController.aliasTopTours, tourController.getTours);

router.route('/tours-data').get(tourController.getToursData);

//Router che prende tours e li conta in base mensile
router
  .route('/monthly-plan/:year')
  .get(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getMonthlyPlan
  );

//Routes tours
router
  .route('/')
  .get(authController.protectRoute, tourController.getTours)
  .post(
    authController.protectRoute,
    tourController.checkData,
    tourController.createTour
  );
router
  .route('/:id')
  .get(authController.protectRoute, tourController.getTour)
  .patch(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.patchTour
  )
  .delete(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
