const mongoose = require('mongoose'); //Importo Mongoose

//Creo nuovo schema Mongoose per tours
const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The tour must have a name'],
    unique: true,
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
});

//Creo Model per tour
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour; //Esporto model per controller
