const mongoose = require('mongoose'); //Importo Mongoose
const slugify = require('slugify'); //Importo slugify

//Creo nuovo schema Mongoose per tours
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'The tour must have a name'],
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    private: {
      type: Boolean,
      required: true,
    },
    duration: {
      type: Number,
      required: [true, 'The tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'The tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'The tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'The tour must have a price'],
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      required: [true, 'The tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'The tour must have a cover'],
      trim: true,
    },
    images: {
      type: [String],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: {
      type: [Date],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Creo Virtual Property per durata tour in settimane
tourSchema.virtual('durationWeeks').get(function () {
  return Math.floor(this.duration / 7);
});

//Creo Model Middleware per eseguire istruzioni prima del salvataggio
tourSchema.pre('save', function (next) {
  //Setto proprietà slug del tour in base al nome
  this.slug = slugify(this.name, { lower: true });

  next();
});

//Creo Query Middleware per tours privati
tourSchema.pre(/^find/, function (next) {
  this.find({
    private: { $ne: true },
  });

  next();
});

//Creo Aggregation Middleware per tours privati
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { private: { $ne: true } },
  });

  next();
});

//Creo Model per tour
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour; //Esporto model per controller
