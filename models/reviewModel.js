const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can't be empty"],
      maxLength: [500, "The review can't exceed 100 characters."],
    },
    rating: {
      type: Number,
      min: [1, 'Review must be equal or more than 1.'],
      max: [5, 'Review must be equal or less than 5.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Creo indice unico per tour e user per evitare review dallo stesso utente
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//Query Middleware per popolare users
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'username photo -_id',
  });

  next();
});

//Metodo statico per calcolo Ratings
reviewSchema.statics.calcRatings = async function (tourId) {
  //Utilizzo aggregation pipeline per recuperare ratings del tour
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        ratingsCount: { $sum: 1 },
        ratingAvg: { $avg: '$rating' },
      },
    },
  ]);

  //Se ci sono delle reviews
  if (stats.length > 0) {
    //Salvo dati in tour
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].ratingsCount,
      ratingsAverage: stats[0].ratingAvg,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

//Utilizzo calcRatings per salvare ratings dopo il salvataggio dei dati
reviewSchema.post('save', function () {
  //this punta alla review attuale
  this.constructor.calcRatings(this.tour);
});

//Query middleware per edit/delete reviews e aggiornamento dati in tour
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //Recupero document tramite query corrente
  this.review = await this.findOne();

  next();
});

//Query middleware post query per calcolare valori e passarli a tour
reviewSchema.post(/^findOneAnd/, async function () {
  this.review.constructor.calcRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
