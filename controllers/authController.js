const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const asyncErrCheck = require('../utils/asyncErr');

//Funzione che genera JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_TOKEN_EXP,
  });

//Metodo che crea l'user
exports.signupUser = asyncErrCheck(async (req, res, next) => {
  //Creo user passando come parametro i dati
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  //Richiamo funzione per generare token
  const token = signToken(req.body._id);

  //Invio risposta
  res.status(201).json({
    status: 'success',
    message: 'User successfully created',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = asyncErrCheck(async (req, res, next) => {
  //Recupero email e password da body
  const { email, password } = req.body;

  //Controllo che siano state passate sia email che password nella richiesta
  if (!email || !password) {
    return next(new AppError('Provide email and password', 400));
  }

  //Controllo che username e password corrispondano
  //Recupero dati utente, utilizzando il '+' su select password per mostrare dati anche se nascosti dal model
  const userData = await User.findOne({ email }).select('+password');

  //Controllo username e password
  if (
    !(
      userData.username === req.body.username &&
      (await userData.passwordCheck(req.body.password, userData.password))
    )
  ) {
    return next(new AppError('Wrong email or password.', 401));
  }

  const token = signToken(userData._id);

  res.status(200).json({
    status: 'success',
    message: 'You logged in!',
    data: {
      username: req.body.username,
      token: token,
    },
  });
});

//Metodo per proteggere routes da utenti non loggati
exports.protectRoute = asyncErrCheck(async (req, res, next) => {
  //Controllo che la richiesta abbia un token nell'header
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //Recupero token
    token = req.headers.authorization.split(' ')[1];
  }

  //Se il token non è presente
  if (!token) {
    return next(new AppError('Login to enter this area.', 400));
  }

  //Controllo token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  //Controllo che l'utente esista ancora
  const existingUser = await User.findById(decodedToken.id);
  if (!existingUser) {
    return next(
      new AppError(
        'The user associated to this token does not exists anymore.',
        401
      )
    );
  }

  //Controllo che non sia stata modificata la password dopo la creazione del token
  if (existingUser.checkNewPasswordDate(decodedToken.iat)) {
    //Se la password è stata cambiara recentemente, ritorno un errore
    return next(
      new AppError('You changed the password recently, log in again.', 401)
    );
  }

  next();
});
