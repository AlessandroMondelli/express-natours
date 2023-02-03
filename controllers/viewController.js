const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
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

  //controllo se l'utente ha già acquistato il tour
  let hasUserBooked;

  if (req.user) {
    hasUserBooked = await Booking.findOne({
      tour: tour.id,
      user: req.user.id,
    });
  }

  if (!tour) {
    return next(new AppError('Tour not found.', 404));
  }

  res.status(200).render('blocks/tour', {
    title: tour.name,
    tour,
    hasUserBooked,
  });
});

exports.login = (req, res) => {
  res.status(200).render('blocks/login', {
    title: 'Login',
  });
};

exports.signUp = (req, res) => {
  res.status(200).render('blocks/signUp', {
    title: 'Sign Up',
  });
};

exports.account = (req, res) => {
  res.status(200).render('blocks/account', {
    title: 'Your Account',
  });
};

exports.myBookings = asyncErrCheck(async (req, res) => {
  //Recupero Bookings dell'utente
  const bookings = await Booking.find({ user: req.user.id });

  //Recupero tours
  const toursIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: toursIDs } });

  res.status(200).render('blocks/overview', {
    title: 'My Bookings',
    tours,
  });
});
