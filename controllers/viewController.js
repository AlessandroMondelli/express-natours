const Tour = require('../models/tourModel');
const asyncErrCheck = require('../utils/asyncErr');
const AppError = require('../utils/appError');

exports.getOverview = asyncErrCheck(async (req, res) => {
  //Recupero dati di tutti i tours
  const tours = await Tour.find();

  res.status(200).render('blocks/overview', {
    title: 'Tours',
    tours,
  });
});

exports.getTourDetails = asyncErrCheck(async (req, res, next) => {
  //Recupero dati tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('Tour not found.', 404));
  }

  res.status(200).render('blocks/tour', {
    title: tour.name,
    tour,
  });
});

exports.login = (req, res, next) => {
  res.status(200).render('blocks/login', {
    title: 'Login',
  });
};

exports.account = (req, res, next) => {
  res.status(200).render('blocks/account', {
    title: 'Your Account',
  });
};
