const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

//Importo routes
const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');

const app = express();

//1 - MIDDLEWARES
app.use(morgan('dev')); //Utilizzo middleware di terze parti per vedere in console la richiesta
app.use(express.json()); //Dichiaro middleware

app.use((req, res, next) => { //Test middleware personalizzato
    const middlewareCheck = "Nuovo middleware";
    req.middlewareCheck = middlewareCheck; //Aggiungo campo a richiesta

    next(); //Passo a prossimo middleware
});

//Dichiaro middlewares per routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app; //Esporto app per importare in server.js