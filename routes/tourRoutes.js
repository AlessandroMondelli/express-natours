const express = require('express');
const tourController = require('../controllers/tourController'); //Import metodi da controller

//Creo router
const router = express.Router();

router.param('id', tourController.checkID); //Richiamo metodo per Param Middleware

//Routes tours
router.route('/').get(tourController.getTours).post(tourController.createTour);
router.route('/:id').get(tourController.getTour).patch(tourController.patchTour).delete(tourController.deleteTour);

module.exports = router;