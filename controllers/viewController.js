const Tour = require('../models/tourModel');
const asyncErrCheck = require('../utils/asyncErr');

exports.getOverview = asyncErrCheck(async (req, res) => {
  //Recupero dati di tutti i tours
  const tours = await Tour.find();

  res.status(200).render('blocks/overview', {
    title: 'Tours',
    tours,
  });
});
exports.getTourDetails = asyncErrCheck(async (req, res) => {
  //Recupero dati tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  await res.status(200).render('blocks/tour', {
    title: tour.name,
    tour,
  });
});
