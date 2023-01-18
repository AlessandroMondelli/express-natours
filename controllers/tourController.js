const Tour = require('../models/tourModel');
const asyncErrCheck = require('../utils/asyncErr');
const AppError = require('../utils/appError');
const handlerFactory = require('../utils/handlerFactory');

//Funzione aliasing per route top-5
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage,price,description';

  next();
};

//Handlers
//Richiamo handler factory per lettura tours
exports.getTours = handlerFactory.getDocs(Tour);

//Richiamo handler factory per lettura tour
exports.getTour = handlerFactory.getDoc(Tour, { path: 'reviews' });

//Richiamo handler factory per creazione tour
exports.createTour = handlerFactory.createDoc(Tour);

//Richiamo handler factory per patch tour
exports.patchTour = handlerFactory.patchDoc(Tour);

//Richiamo handler factory per eliminazione tour
exports.deleteTour = handlerFactory.deleteDoc(Tour);

//Handler che recupera tour in un certo radiante
exports.getToursWithin = asyncErrCheck(async (req, res, next) => {
  //Recupero parametri
  const { distance, latlng, unit } = req.params;

  //Separo latitudine e longitudine
  const [lat, lng] = latlng.split(',');

  //Controllo che latitudine e longitudine siano formattate correttamente
  if (!lat || !lng) {
    return next(
      new AppError('Provide latitude and longitude in (lat,long) format.', 400)
    );
  }

  //Calcolo raggio tramite radianti
  const radius = unit === 'km' ? distance / 6378.1 : distance / 3963.2;

  //Cerco tours in base a raggio
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    toursCont: tours.length,
    data: {
      tours,
    },
  });
});

//Handler che calcola distanza tours da un punto
exports.getToursDistances = asyncErrCheck(async (req, res, next) => {
  //Recupero parametri
  const { latlng, unit } = req.params;

  //Separo latitudine e longitudine
  const [lat, lng] = latlng.split(',');

  //Controllo che latitudine e longitudine siano formattate correttamente
  if (!lat || !lng) {
    return next(
      new AppError('Provide latitude and longitude in (lat,long) format.', 400)
    );
  }

  //Salvo moltiplicatore per convertire metri
  const multiplier = unit === 'km' ? 0.001 : 0.000621371;

  //Aggregare che recupera dati con distanze
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});

//Creo aggregation pipeline per Tours
exports.getToursData = asyncErrCheck(async (req, res, next) => {
  const toursData = await Tour.aggregate([
    {
      //Cerco tours con rating alto più o uguale 4.5
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        toursCont: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: -1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: toursData,
  });
});

//Creo aggregation pipeline per fare una stima annuale dei tours
exports.getMonthlyPlan = asyncErrCheck(async (req, res, next) => {
  //Recupero anno da url
  const year = req.params.year * 1;

  const monthlyData = await Tour.aggregate([
    //Scompongo array di date in singoli elementi
    {
      $unwind: '$startDates',
    },
    {
      //Seleziono con query gli elementi che vanno dal 1 gennaio al 31 dicembre 2021
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    //Raggruppo valori per mese
    {
      $group: {
        _id: { $month: '$startDates' },
        toursStartCount: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    //Aggiungo un campo che mostra il mese
    {
      $addFields: {
        month: '$_id',
      },
    },
    //Nascondo id
    {
      $project: {
        _id: 0,
      },
    },
    //Ordine decrescente
    {
      $sort: { toursStartCount: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: monthlyData,
  });
});
