const Tour = require('../models/tourModel');

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
    //Escludo parametri non inerenti a DB per Query
    //Hard save su nuovo oggetto per parametri query
    const toursQueryObj = { ...req.query };

    //Campi da escludere
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    //Elimino campi non necessari da query
    excludedFields.forEach((el) => delete toursQueryObj[el]);

    //Filtro avanzato
    //Trasformo in stringa nuovo oggetto
    let toursObjString = JSON.stringify(toursQueryObj);
    //Aggiungo simbolo $ per filtro avanzato
    toursObjString = toursObjString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    //Salvo query ritrasformandola in formato JSON
    const toursQuery = Tour.find(JSON.parse(toursObjString));

    //Recupero tutti i tour dalla collection
    const tours = await toursQuery;

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
