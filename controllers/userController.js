const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const asyncErrCheck = require('../utils/asyncErr');
const handlerFactory = require('../utils/handlerFactory');
const ObjectId = require('mongoose').Types.ObjectId;

//Setto local storage per multer
const multerStorage = multer.memoryStorage();

//Aggiungo filtro per immagini
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('File not supported.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//Middleware Upload immagine
exports.uploadUserPhoto = upload.single('photo');

//Middleware resize
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  //Setto filename nella request, per utilizzarlo nel prossimo middleware
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  //Resize immagine
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

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

  //Salvo nuova foto in database
  if (req.file) filteredUser.photo = req.file.filename;

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

//Metodo per aggiungere bookmark
exports.toggleBookmark = asyncErrCheck(async (req, res, next) => {
  const userId = req.user.id;
  const tourId = req.body.tourId;

  const user = await User.findById(userId);

  if (user.toursBookmark.includes(tourId)) {
    await User.findByIdAndUpdate(userId, {
      $pull: { toursBookmark: ObjectId(tourId) },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Tour removed from bookmarks.',
    });
  }

  //Aggiungo ad array preferiti il tour scelto
  await User.findByIdAndUpdate(userId, {
    $push: { toursBookmark: tourId },
  });

  res.status(200).json({
    status: 'success',
    message: 'Tour added to bookmarks.',
  });
});
