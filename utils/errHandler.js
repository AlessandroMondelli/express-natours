const AppError = require('./appError');

//Funzione per inviare messaggio per valori duplicati
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}.`;

  return new AppError(message, 400);
};

//Funzioni per gestire gli errori in base a modalità ambiente
const errOutputDevelopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const errOutputProduction = (err, res) => {
  if (err.isOperational) {
    //Controllo se è un errore operazionale
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    //Se è un bug o errore di dipendenze di terze parti
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    errOutputDevelopment(err, res); //Richiamo funzione che gestisce errori per modalità sviluppo
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; //Creo hard copy di error

    if (err.code === 11000) error = handleDuplicateFieldsDB(error); //Modifico errore richiamando funzione che inserisce messaggio errore
    if (err.name === 'ValidationError') error = new AppError(err.message, 400); //Controllo errori di validazione e ritorno messaggio

    //Controllo errori token
    if (err.name === 'JsonWebTokenError')
      error = new AppError('Invalid token, log in again.', 401);
    if (err.name === 'TokenExpiredError')
      error = new AppError('Token expired, log in again', 401);

    errOutputProduction(error, res); //Richiamo funzione che gestisce errori per modalità produzione
  }
};
