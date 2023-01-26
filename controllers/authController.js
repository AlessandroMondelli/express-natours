const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const asyncErrCheck = require('../utils/asyncErr');
const Email = require('../utils/email');

//Funzione che genera JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_TOKEN_EXP,
  });

//Funzione che effettua login e ritorna risposta
const loginUserToken = (res, user, statusCode) => {
  const loginToken = signToken(user.id);

  //Salvo opzioni cookie
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXP * 60 * 60 * 1000),
    httpOnly: true,
  };

  //Se in produzione, attivo protezione https
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  //Invio cookie a client
  res.cookie('jwt', loginToken, cookieOptions);

  //Nascondo password da risposta
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: loginToken,
    data: {
      user,
    },
  });
};

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

  //invio email di benvenuto
  const url = `${req.protocol}://${req.host}/me`;
  await new Email(newUser, url).sendWelcome();

  //Invio token e risposta
  loginUserToken(res, newUser, 201);
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
      userData.email === req.body.email &&
      (await userData.passwordCheck(req.body.password, userData.password))
    )
  ) {
    return next(new AppError('Wrong email or password.', 403));
  }

  loginUserToken(res, userData, 200);
});

exports.logout = (req, res) => {
  //Invio cookie vuoto a client
  res.cookie('jwt', 'null', {
    expires: new Date(Date.now() - 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

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
  } else if (req.cookies.jwt) {
    //Recupero token da cookies
    token = req.cookies.jwt;
  }

  //Se il token non è presente
  if (!token) {
    return next(new AppError('Login to enter this area.', 403));
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
  //Se l'utente è loggato, salvo in locals l'utente per utilizzare dati in template
  res.locals.user = currentUser;

  next();
});

//Metodo per controllare se l'utente corrente sia loggato
exports.isLoggedIn = async (req, res, next) => {
  //Controllo che la richiesta abbia un token
  if (req.cookies.jwt) {
    try {
      //Controllo validità token
      const decodedToken = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET_KEY
      );

      //Controllo che l'utente esista ancora
      const currentUser = await User.findById(decodedToken.id);
      //Se non esiste, passo a prossimo middleware
      if (!currentUser) {
        return next();
      }

      //Controllo che non sia stata modificata la password dopo la creazione del token
      if (currentUser.checkNewPasswordDate(decodedToken.iat)) {
        //Se la password è stata cambiara recentemente, ritorno un errore
        return next();
      }

      //Se l'utente è loggato, salvo in locals l'utente per utilizzare dati in template
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  //Se non è presente il cookie, passo direttamente a prossimo middleware
  next();
};

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
  try {
    //Creo url per rigenerazione password
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${token}`;

    await new Email(user, resetUrl).resetPassword();

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

//Metodo che resetta password dopo email con token
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
  loginUserToken(res, userByResetToken, 200);
});

//Metodo che permette agli utenti loggati di cambiare password
exports.updatePassword = asyncErrCheck(async (req, res, next) => {
  //Recupero utente corrente con oggetto già presente in req
  const currentUser = await User.findById(req.user.id).select('+password');

  if (!currentUser) {
    return next(new AppError('User not defined, try again.', 403));
  }

  //Controllo che la password inserita sia corretta
  const { oldPassword } = req.body;

  if (!(await currentUser.passwordCheck(oldPassword, currentUser.password))) {
    return next(new AppError('You inserted the wrong password.', 403));
  }

  //Aggiorno password
  currentUser.password = req.body.newPassword;
  currentUser.passwordConfirm = req.body.newPasswordConfirm;

  await currentUser.save();

  //Effettuo login automatico utente
  loginUserToken(res, currentUser, 200);
});
