const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const asyncErrCheck = require('../utils/asyncErr');
const AppError = require('../utils/appError');
const handlerFactory = require('../utils/handlerFactory');

//Multer per aggiornamento immagini tour
//Setto local storage per multer
const multerStorage = multer.memoryStorage();

//Aggiungo filtro per immagini
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('File not supported.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//Middleware Upload immagine
exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);

//Middleware ottimizzazione immagine
exports.resizeTourImages = asyncErrCheck(async (req, res, next) => {
  //Se non ci sono immagini passo al prossimo middleware
  if (!req.files.imageCover) return next();

  //Cover image
  //Aggiungo nome file a body
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpg`;

  //Ottimizzo immagine
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  if (!req.files.images) return next();
  //Images
  //preparo array dove caricare nomi immagini
  req.body.images = [];

  //Attendo che tutte le promise siano risolte
  await Promise.all(
    //itero immagini
    req.files.images.map(async (file, i) => {
      //genero nome
      const imageName = `tour-${req.params.id}-${Date.now()}-${i}.jpg`;

      //ottimizzo immagine
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageName}`);

      //Salvo nome immagine in body
      req.body.images.push(imageName);
    })
  );

  next();
});

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

//Middleware che controlla disponibilità data
exports.checkTourParticipants = asyncErrCheck(async (req, res, next) => {
  const { tour, bookDate } = req.query;

  if (!tour || !bookDate) return next();

  //Creo data recuperata da query
  const date = new Date(bookDate);
  date.setHours(1);

  const bookedTour = await Tour.findById(tour);

  for (let i = 0; i < bookedTour.startDates.length; i++) {
    if (bookedTour.startDates[i].date.getTime() === date.getTime()) {
      bookedTour.startDates[i].participants += 1;

      if (bookedTour.startDates[i].participants === bookedTour.maxGroupSize) {
        bookedTour.startDates[i].soldOut = true;
      }
    }
  }

  await bookedTour.save();

  res.redirect(req.originalUrl.split('?')[0]);
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
        'startDates.date': {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    //Raggruppo valori per mese
    {
      $group: {
        _id: { $month: '$startDates.date' },
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
