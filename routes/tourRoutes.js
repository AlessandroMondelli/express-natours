const express = require('express');
const tourController = require('../controllers/tourController'); //Import metodi da controller

//Creo router
const router = express.Router();

//Creo route Alias per recuperare 5 top tours in base a rating e prezzo
router
  .route('/top-5')
  .get(tourController.aliasTopTours, tourController.getTours);

router.route('/tours-data').get(tourController.getToursData);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

//Routes tours
router
  .route('/')
  .get(tourController.getTours)
  .post(tourController.checkData, tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.patchTour)
  .delete(tourController.deleteTour);

module.exports = router;
