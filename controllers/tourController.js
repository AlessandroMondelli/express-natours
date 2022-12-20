const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

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
exports.getTours = async (req, res) => {
  //DONE: GET Tours
  try {
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
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'Tours not found',
      error: error,
    });
  }
};

exports.getTour = async (req, res) => {
  //DONE: GET Tour
  try {
    //Recupero tour tramite id
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: 'Tour not found',
      error: error,
    });
  }
};

exports.createTour = async (req, res) => {
  //DONE: POST Tour
  try {
    const newTour = await Tour.create(req.body); //Creo document in database recuperando contenuto da req.body

    //In caso di successo ritorno messaggio con dati inseriti
    res.status(201).json({
      status: 'success',
      data: {
        newTour,
      },
    });
  } catch (error) {
    //In caso di errore ritorno messaggio
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.patchTour = async (req, res) => {
  //DONE: PATCH Tour
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  //DONE: Delete tour
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      message: error,
    });
  }
};
