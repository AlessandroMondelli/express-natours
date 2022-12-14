const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');

//Importo modulo per gestire errori
const AppError = require('./utils/appError');
const globalErrHandler = require('./utils/errHandler');

//Importo routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

//1 - MIDDLEWARES GLOBALI
//Middleware per aggiungere headers di sicurezza aggiuntivi
app.use(helmet());

//Middleware che fa sanitize delle request per evitare NoSQL Injections
app.use(mongoSanitize());

//Middleware che evita Cross-Scripting
app.use(xssClean());

//Middleware che evita Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'duration',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//Uso morgan in modalità dev solo se l'ambiente è in modalità development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //Utilizzo middleware di terze parti per vedere in console la richiesta solo se sono in modalità development
}

//Middleware che limita richiesta dallo stesso IP
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: "You sent too many request, you're a hacker, aren't you?",
});

app.use('/api', limiter);

app.use(express.json()); //Dichiaro middleware

//Dichiaro middlewares per routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//Definisco errore generico in caso di route non gestita
app.use('*', (req, res, next) => {
  //Richiamo classe gestione errori
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Definisco middleware che cattura tutti gli errori dei middleware esistenti
app.use(globalErrHandler);

module.exports = app; //Esporto app per importare in server.js
