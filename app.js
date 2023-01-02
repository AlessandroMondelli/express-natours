const express = require('express');
const morgan = require('morgan');

//Importo modulo per gestire errori
const AppError = require('./utils/appError');
const globalErrHandler = require('./utils/errHandler');

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
  //Richiamo classe gestione errori
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Definisco middleware che cattura tutti gli errori dei middleware esistenti
app.use(globalErrHandler);

module.exports = app; //Esporto app per importare in server.js
