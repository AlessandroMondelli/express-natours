const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const asyncErrCheck = require('../utils/asyncErr');
const AppError = require('../utils/appError');

exports.getOverview = asyncErrCheck(async (req, res) => {
  //Recupero dati di tutti i tours
  const tours = await Tour.find();
  const currentUserBookmarks = await User.findById(req.user.id).select(
    'toursBookmark'
  );

  res.status(200).render('blocks/overview', {
    title: 'Tours',
    tours,
    currentUserBookmarks,
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

  //controllo se l'utente ha già acquistato il tour
  let hasUserBooked;
  let review;

  if (req.user) {
    hasUserBooked = await Booking.findOne({
      tour: tour.id,
      user: req.user.id,
    });

    if (hasUserBooked) {
      review = await Review.findOne({
        tour: tour.id,
        user: req.user.id,
      });
    }
  }

  res.status(200).render('blocks/tour', {
    title: tour.name,
    tour,
    hasUserBooked,
    review,
  });
});

exports.login = (req, res) => {
  res.status(200).render('auth/login', {
    title: 'Login',
  });
};

exports.signUp = (req, res) => {
  res.status(200).render('auth/signUp', {
    title: 'Sign Up',
  });
};

exports.account = (req, res) => {
  res.status(200).render('user/userInfo', {
    title: 'Your Account',
  });
};

exports.myBookings = asyncErrCheck(async (req, res) => {
  //Recupero Bookings dell'utente
  const bookings = await Booking.find({ user: req.user.id });

  //Recupero tours
  const toursIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: toursIDs } });

  res.status(200).render('user/myBookings', {
    title: 'My Bookings',
    tours,
  });
});

exports.myReviews = asyncErrCheck(async (req, res) => {
  //Recupero reviews utente
  const reviews = await Review.find({ user: req.user.id }).populate('tour');

  res.status(200).render('user/myReviews', {
    title: 'My reviews',
    reviews,
  });
});

//admin views
exports.adminManageTours = asyncErrCheck(async (req, res) => {
  //Recupero tours
  const tours = await Tour.find();

  res.status(200).render('admin/manage', {
    title: 'Manage',
    tours,
  });
});
