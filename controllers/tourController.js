const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
); //Ricevo dati da file, trasformando da JSON a JS

exports.checkID = (req, res, next, val) => {
  //Creo metodo per controllo ID da utilizzare in un Param Middleware
  const id = req.params.id * 1; //Recupero id da url e lo trasformo in numero
  const tour = tours.find((el) => el.id === id);

  console.log(`ID passato in param middleware: ${id}`);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

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
exports.getTours = (req, res) => {
  //Assegno a costante funzione per recuperare tours
  res.status(200).json({
    status: 'success',
    elements: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  //Assegno a costante funzione per recuperare tour
  const id = req.params.id * 1; //Recupero id da url e lo trasformo in numero
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  //Assegno a costante funzione per creare tour
  const id = tours[tours.length - 1].id + 1; //Recupero id da ultimo elemento dell'oggetto
  const newTour = Object.assign(
    //Faccio merge di due oggetti per unire nuovo id a corpo della richiesta
    { id: id },
    req.body
  );

  tours.push(newTour); //Aggiungo ad array di oggetti tours il nuovo tour

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      //Scrivo su file trasformando in JSON l'oggetto che abbiamo creato
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.patchTour = (req, res) => {
  const id = req.params.id * 1; //Recupero id da url e lo trasformo in numero
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1; //Recupero id da url e lo trasformo in numero
  const tour = tours.find((el) => el.id === id);

  res.status(204).json({
    status: 'success',
    data: {
      tour,
    },
  });
};
