const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const asyncErrCheck = require('../utils/asyncErr');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

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
    token: token,
    data: {
      username: req.body.username,
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
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user associated to this token does not exists anymore.',
        401
      )
    );
  }

  //Controllo che non sia stata modificata la password dopo la creazione del token
  if (currentUser.checkNewPasswordDate(decodedToken.iat)) {
    //Se la password è stata cambiara recentemente, ritorno un errore
    return next(
      new AppError('You changed the password recently, log in again.', 401)
    );
  }

  req.user = currentUser;

  next();
});

//Metodo che blocca accesso a sezioni che richiedo un determinato ruolo
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //Controllo se il ruolo è adatto per accettare la richiesta
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have rights to perform this action.", 403)
      );
    }

    next();
  };

//Metodo che gestisce richiesta rigenerazione password
exports.forgotPassword = asyncErrCheck(async (req, res, next) => {
  //Recupero user in base all'email allegata alla request
  const user = await User.findOne({ email: req.body.email });

  //Ritorno errore se non trovo l'utente
  if (!user) {
    return new AppError('This email is associated not to any user.', 404);
  }

  //Creo token da inviare per email
  const token = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //Invio email con token
  //Creo url per rigenerazione password
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${token}`;

  //Creo messaggio da inviare all'utente
  const message = `Send a PATCH request to this url (${resetUrl}) with your new password and passwordConfirm.`;

  //Invio email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset password - Natours',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent successfully',
    });
  } catch (err) {
    //Annullo token creato
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpired = undefined;

    user.save({ validateBeforeSave: false });

    return next(
      new AppError('Something went wrong with your email, try later.', 500)
    );
  }
});

exports.resetPassword = asyncErrCheck(async (req, res, next) => {
  //Recupero e rendo criptato il token presente nella request dell'utente
  const cryptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //Cerco user in base al token e alla data di scadenza
  const userByResetToken = await User.findOne({
    passwordResetToken: cryptedToken,
    passwordResetTokenExpire: { $gt: Date.now() },
  });

  //Se non trovo l'utente, ritorno un errore
  if (!userByResetToken) {
    return next(
      new AppError('Token not valid or has expired, retry again.'),
      400
    );
  }

  //Altrimenti salvo dati
  userByResetToken.password = req.body.password;
  userByResetToken.passwordConfirm = req.body.passwordConfirm;
  userByResetToken.passwordResetToken = undefined;
  userByResetToken.passwordResetTokenExpired = undefined;

  await userByResetToken.save();

  //Login utente
  const token = signToken(userByResetToken._id);

  res.status(200).json({
    status: 'success',
    message: 'You logged in!',
    token: token,
    data: {
      username: userByResetToken.username,
    },
  });
});
