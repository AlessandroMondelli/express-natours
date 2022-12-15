const express = require('express');
const tourController = require('../controllers/tourController'); //Import metodi da controller

//Creo router
const router = express.Router();

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
