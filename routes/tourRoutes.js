const express = require('express');
const tourController = require('../controllers/tourController'); //Import metodi da controller
const authController = require('../controllers/authController'); //Import metodi auth da controller
const bookingController = require('../controllers/bookingController'); //Import metodi booking da controller
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

//Route che calcola tour vicini in un determinato radiante
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

//Route che calcola distanza tours da un punto
router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getToursDistances);

//Routes tours
router
  .route('/')
  .get(tourController.getTours)
  .post(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

//Routes con parametro id tour
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.patchTour
  )
  .delete(
    authController.protectRoute,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//Route che fornisce le prenotazioni per un determinato tour
router
  .route('/:id/bookings')
  .get(
    authController.protectRoute,
    authController.restrictTo('admin'),
    bookingController.getBookingsByPar
  );

module.exports = router;
