const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Tour ID is required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'User ID is required'],
    },
    price: {
      type: Number,
      require: [true, 'Price is required'],
    },
    date: Date,
    paid: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Creo indice unico per tour e user per evitare bookings dallo stesso utente
bookingSchema.index({ tour: 1, user: 1 }, { unique: true });

//Metodo eseguito prima della ricerca dei bookings, che popola user e tour
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
