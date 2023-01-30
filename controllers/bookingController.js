const Stripe = require('stripe');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('../utils/handlerFactory');
const asyncErrCheck = require('../utils/asyncErr');
const AppError = require('../utils/appError');

exports.getCheckoutSession = asyncErrCheck(async (req, res, next) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    //recupero tour corrente da parametro
    const tour = await Tour.findById(req.params.tourId);

    //Creo sessione checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
        req.params.tourId
      }&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            unit_amount: tour.price * 100,
            currency: 'eur',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            },
          },
        },
      ],
      mode: 'payment',
    });

    //Invio response con sessione
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (err) {
    next(new AppError(`Stripe session error: ${err}`, 400));
  }
});

//Metodo non sicuro che crea bookings dopo checkout
//TODO: utilizzare stripe webhooks in produzione
exports.createBookingAfterCheckout = asyncErrCheck(async (req, res, next) => {
  //Recupero dati da url
  const { tour, user, price } = req.query;

  //Controllo che esistano
  if (!tour || !user || !price) return next();

  //Creo document
  await Booking.create({ tour, user, price });

  //Redirect a pagina originale senza query string
  res.redirect(req.originalUrl.split('?')[0]);
});

//Metodo per controllare che l'user abbia la prenotazione
exports.hasUserBooked = asyncErrCheck(async (req, res, next) => {
  const book = await Booking.find({ tour: req.body.tour, user: req.body.user });

  if (book.length === 0) {
    return next(new AppError('You must buy the tour to write a review.', 401));
  }

  next();
});

//Metodi CRUD per API
exports.getBookings = factory.getDocs(Booking);
exports.getBooking = factory.getDoc(Booking);
exports.createBooking = factory.createDoc(Booking);
exports.patchBooking = factory.patchDoc(Booking);
exports.deleteBooking = factory.deleteDoc(Booking);
