const Stripe = require('stripe');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('../utils/handlerFactory');
const asyncErrCheck = require('../utils/asyncErr');
const AppError = require('../utils/appError');

const hasUserBooked = async (tour, user) => {
  try {
    let userBooked;

    if (user) {
      userBooked = await Booking.findOne({
        tour,
        user: user.id,
      });

      if (userBooked) {
        return true;
      }
    }

    return false;
  } catch (err) {
    return err;
  }
};

exports.getCheckoutSession = asyncErrCheck(async (req, res, next) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    //recupero tour corrente da parametro
    const tour = await Tour.findById(req.params.tourId);

    //Recupero data scelta
    const { year, month, day } = req.params;

    //Controllo se utente ha già acquistato
    const userBooked = await hasUserBooked(tour, req.user);

    if (!userBooked) {
      //Creo sessione checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${
          req.params.tourId
        }&user=${req.user.id}&price=${
          tour.price
        }&bookDate=${year}-${month}-${day}`,
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
                images: [
                  `https://www.natours.dev/img/tours/${tour.imageCover}`,
                ],
              },
            },
          },
        ],
        mode: 'payment',
      });

      //Invio response con sessione
      return res.status(200).json({
        status: 'success',
        session,
      });
    }

    //Redirect in caso di tour già prenotato
    res.status(401).redirect('/');
  } catch (err) {
    next(new AppError(`Stripe session error: ${err}`, 400));
  }
});

//Metodo non sicuro che crea bookings dopo checkout
//TODO: utilizzare stripe webhooks in produzione
exports.createBookingAfterCheckout = asyncErrCheck(async (req, res, next) => {
  //Recupero dati da url
  const { tour, user, price, bookDate } = req.query;

  //Controllo che esistano
  if (!tour || !user || !price) return next();

  //Creo data recuperata da query
  const date = new Date(bookDate);
  date.setHours(1);

  //Creo document
  await Booking.create({ tour, user, price, date });

  //Redirect a pagina originale senza query string
  next();
});

//Metodo per controllare che l'user abbia la prenotazione
exports.hasUserBooked = asyncErrCheck(async (req, res, next) => {
  const book = await Booking.find({ tour: req.body.tour, user: req.body.user });

  if (book.length === 0) {
    return next(new AppError('You must book the tour to write a review.', 401));
  }

  next();
});

exports.getBookingsByPar = asyncErrCheck(async (req, res, next) => {
  try {
    //Recupero url per richiesta
    const urlReq = req.originalUrl;

    //Recupero id
    const idPar = req.params.id;

    let bookingsByPar;

    if (urlReq.includes('tour')) {
      //Recupero bookings per tour
      bookingsByPar = await Booking.find({ tour: idPar });
    } else if (urlReq.includes('user')) {
      //Recupero bookings per user
      bookingsByPar = await Booking.find({ user: idPar });
    }

    res.status(200).json({
      status: 'success',
      data: {
        bookings: bookingsByPar,
      },
    });
  } catch (err) {
    next(`Error: ${err}`, 400);
  }
});

//Metodi CRUD per API
exports.getBookings = factory.getDocs(Booking);
exports.getBooking = factory.getDoc(Booking);
exports.createBooking = factory.createDoc(Booking);
exports.patchBooking = factory.patchDoc(Booking);
exports.deleteBooking = factory.deleteDoc(Booking);
