const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const asyncErrCheck = require('../utils/asyncErr');
const AppError = require('../utils/appError');

exports.getOverview = asyncErrCheck(async (req, res) => {
  //Recupero dati di tutti i tours
  const tours = await Tour.find();
  let currentUserBookmarks;

  if (req.user) {
    currentUserBookmarks = await User.findById(req.user.id).select(
      'toursBookmark'
    );
  }

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

exports.myBookmarks = asyncErrCheck(async (req, res) => {
  //Cerco bookmarks per utente
  const findBookmarks = await User.findById(req.user.id)
    .populate('toursBookmark')
    .select('toursBookmark');

  const bookmarks = findBookmarks.toursBookmark;

  res.status(200).render('user/myBookmarks', {
    title: 'My Bookmarks',
    bookmarks,
  });
});

//admin views
exports.adminManage = asyncErrCheck(async (req, res) => {
  let data;
  let path;

  if (req.originalUrl.includes('tours')) {
    //Recupero tours
    data = await Tour.find();
    path = 'tours';
  } else if (req.originalUrl.includes('users')) {
    //Recupero users
    data = await User.find();
    path = 'users';
  } else if (req.originalUrl.includes('reviews')) {
    //Recupero reviews
    data = await Review.find().populate({
      path: 'tour',
      select: 'name imageCover',
    });
    path = 'reviews';
  } else if (req.originalUrl.includes('bookings')) {
    //Recupero bookings
    data = await Booking.find();
    path = 'bookings';
  }

  res.status(200).render('admin/manage', {
    title: 'Manage',
    path,
    data,
  });
});

exports.adminCreateTour = (req, res) => {
  res.status(200).render('admin/createTour', {
    title: 'Create tour',
  });
};

exports.adminEditTour = asyncErrCheck(async (req, res) => {
  const tour = await Tour.findById(req.params.tourId);
  const guides = await User.find({
    $or: [{ role: 'guide' }, { role: 'lead-guide' }],
  });

  res.status(200).render('admin/editTour', {
    title: 'Edit tour',
    tour,
    guides,
  });
});

exports.adminCreateUser = (req, res) => {
  res.status(200).render('admin/createUser', {
    title: 'Create user',
  });
};

exports.adminEditUser = asyncErrCheck(async (req, res) => {
  const user = await User.findById(req.params.userId).select(
    'username email photo role'
  );

  res.status(200).render('admin/editUser', {
    title: 'Edit user',
    user,
  });
});
