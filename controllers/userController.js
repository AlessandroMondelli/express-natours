const User = require('../models/userModel');
const AppError = require('../utils/appError');
const asyncErrCheck = require('../utils/asyncErr');
const APIFeatures = require('../utils/apiFeatures');

//Handlers users
exports.getUsers = asyncErrCheck(async (req, res, next) => {
  //Calcolo numero utentis
  const usersCont = await User.countDocuments();

  //Utilizzo APIFeatures per aggiungere filters, ecc.
  const usersFeatures = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .selectFields()
    .pagination(usersCont);

  //Recupero utenti da query modificata
  const users = await usersFeatures.query;

  res.status(200).json({
    status: 'success',
    count: usersCont,
    data: {
      users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'Route in costruzione',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'Route in costruzione',
  });
};
exports.patchUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'Route in costruzione',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'Route in costruzione',
  });
};
