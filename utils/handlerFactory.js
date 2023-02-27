const asyncErrCheck = require('./asyncErr');
const AppError = require('./appError');
const APIFeatures = require('./apiFeatures');

exports.getDocs = (Model) =>
  asyncErrCheck(async (req, res, next) => {
    //Definisco filter per controllare se è presente un tour da filtrare per GET Nested
    let tourFilter = {};

    //Se è presente l'id del tour, creo filtro
    if (req.params.tourId) tourFilter = { tour: req.params.tourId };

    //Conto documents del model
    const docsCount = await Model.countDocuments();

    //Creo nuova istanza della classe che contiene le features e richiamo funzione filter
    const features = new APIFeatures(Model.find(tourFilter), req.query)
      .filter()
      .sort()
      .selectFields()
      .pagination(docsCount);

    //Recupero tutti i document dalla collection
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      count: docsCount,
      data: {
        docs,
      },
    });
  });

exports.getDoc = (Model, toPopulate) =>
  asyncErrCheck(async (req, res, next) => {
    //Creo query tramite id
    let query = await Model.findById(req.params.id);

    //Se sono stati passati dei parametri per popolazione, proseguo
    if (toPopulate) query = query.populate(toPopulate);

    //Salvo in costante risultato promise query
    const doc = await query;

    //Controllo se document non esiste
    if (!doc) {
      return next(
        new AppError(
          `The document with id ${req.params.id} does not exists.`,
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

//Funzione che crea document
exports.createDoc = (Model) =>
  asyncErrCheck(async (req, res, next) => {
    //Controllo se sia presente una data da trasformare
    if (req.body.startDates?.length !== 0) {
      req.body.startDates.forEach((el, index) => {
        req.body.startDates[index] = JSON.parse(el);
      });
    }

    //Controllo se siano presenti delle location
    if (req.body.locations?.length !== 0) {
      req.body.locations.forEach((el, index) => {
        req.body.locations[index] = JSON.parse(el);
      });
    }

    const doc = await Model.create(req.body); //Creo document in database recuperando contenuto da req.body

    //In caso di successo ritorno messaggio con dati inseriti
    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

//Funzione che modifica document richiesto
exports.patchDoc = (Model) =>
  asyncErrCheck(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    //Controllo se tour non esiste
    if (!doc) {
      return next(
        new AppError(
          `The document with id ${req.params.id} does not exists.`,
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

//Funzione che elimina document richiesto
exports.deleteDoc = (Model) =>
  asyncErrCheck(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    //Controllo se tour non esiste
    if (!doc) {
      return next(
        new AppError(
          `The document with id ${req.params.id} does not exists.`,
          404
        )
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
