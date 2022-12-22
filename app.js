const express = require('express');
const morgan = require('morgan');

//Importo routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1 - MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //Utilizzo middleware di terze parti per vedere in console la richiesta solo se sono in modalità development
}

app.use(express.json()); //Dichiaro middleware

//Dichiaro middlewares per routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Definisco errore generico in caso di route non gestita
app.use('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);

  next(err);
});

//Definisco middleware che cattura tutti gli errori dei middleware esistenti
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    status: status,
    message: `Error: ${err.message}`,
  });
});

module.exports = app; //Esporto app per importare in server.js
