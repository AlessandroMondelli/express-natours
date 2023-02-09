const Review = require('../models/reviewModel');
const handlerFactory = require('../utils/handlerFactory');

exports.getReviews = handlerFactory.getDocs(Review);

exports.getReview = handlerFactory.getDoc(Review);

exports.createReview = handlerFactory.createDoc(Review);

exports.patchReview = handlerFactory.patchDoc(Review);

exports.deleteReview = handlerFactory.deleteDoc(Review);
