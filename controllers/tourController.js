const Tour = require('../models/tourModel');
const asyncErrCheck = require('../utils/asyncErr');
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
