const User = require('../models/userModel');
const AppError = require('../utils/appError');
const asyncErrCheck = require('../utils/asyncErr');
const handlerFactory = require('../utils/handlerFactory');

//Funzione che filtra oggetto in base a parametri
const filterObj = (obj, ...fields) => {
  //Dichiaro nuovo oggetto
  const newObj = {};

  //Recupero keys oggetto e le itero
  Object.keys(obj).forEach((el) => {
    //Se trovo key desiderata
    if (fields.includes(el)) {
      //Aggiungo dati a nuovo oggetto
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

//Handlers users
exports.getUsers = handlerFactory.getDocs(User);

exports.createUser = handlerFactory.createDoc(User);

exports.getUser = handlerFactory.getDoc(User);

exports.patchUser = handlerFactory.patchDoc(User);

exports.deleteUser = handlerFactory.deleteDoc(User);

//Middleware da eseguire per /me endpoint
exports.getMe = (req, res, next) => {
  //Setto parametro user id per utilizzare factory function getDoc
  req.params.id = req.user.id;

  next();
};

exports.updateCurrentUser = asyncErrCheck(async (req, res, next) => {
  //Controllo che l'utente non voglia modificare la password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('You cannot update your password here.', 400));
  }

  //Aggiorno dati utenti
  //Filtro prima l'oggetto per non permettere di modificare dati sensibili
  const filteredUser = filterObj(req.body, 'username', 'email');

  //Aggiorno dati
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredUser, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//Metodo per eliminazione user (setta lo stato active a false)
exports.deleteCurrentUser = asyncErrCheck(async (req, res, next) => {
  //Setto isActive a false
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
