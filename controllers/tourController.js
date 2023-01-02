const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const asyncErrCheck = require('../utils/asyncErr');
const AppError = require('../utils/appError');

//Funzione aliasing per route top-5
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage,price,description';

  next();
};

exports.checkData = (req, res, next) => {
  //Creo metodo per controllo ID da utilizzare in un Param Middleware
  const tour = req.body;

  if (!tour.name || !tour.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid name or price',
    });
  }

  next();
};

//Handlers
exports.getTours = asyncErrCheck(async (req, res, next) => {
  //Conto documents del model
  const toursCount = await Tour.countDocuments();
  //Creo nuova istanza della classe che contiene le features e richiamo funzione filter
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .selectFields()
    .pagination(toursCount);

  //Recupero tutti i tour dalla collection
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    count: toursCount,
    data: {
      tours,
    },
  });
});

exports.getTour = asyncErrCheck(async (req, res, next) => {
  //Recupero tour tramite id
  const tour = await Tour.findById(req.params.id);

  //Controllo se tour non esiste
  if (!tour) {
    return next(
      new AppError(`The tour with id ${req.params.id} does not exists.`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = asyncErrCheck(async (req, res, next) => {
  const newTour = await Tour.create(req.body); //Creo document in database recuperando contenuto da req.body

  //In caso di successo ritorno messaggio con dati inseriti
  res.status(201).json({
    status: 'success',
    data: {
      newTour,
    },
  });
});

exports.patchTour = asyncErrCheck(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  //Controllo se tour non esiste
  if (!tour) {
    return next(
      new AppError(`The tour with id ${req.params.id} does not exists.`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = asyncErrCheck(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  //Controllo se tour non esiste
  if (!tour) {
    return next(
      new AppError(`The tour with id ${req.params.id} does not exists.`, 404)
    );
  }

  res.status(204).json({
    status: 'success',
    data: null,
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
