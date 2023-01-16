const Review = require('../models/reviewModel');
const handlerFactory = require('../utils/handlerFactory');

exports.getReviews = handlerFactory.getDocs(Review);

exports.getReview = handlerFactory.getDoc(Review);

//Creo middleware da eseguire prima di createReview
exports.setTourAndUserId = (req, res, next) => {
  //Recupero tourId da parametro url
  req.body.tour = req.params.tourId;
  //Recupero user attuale
  req.body.user = req.user.id;

  next();
};

exports.createReview = handlerFactory.createDoc(Review);

exports.patchReview = handlerFactory.patchDoc(Review);

exports.deleteReview = handlerFactory.deleteDoc(Review);
