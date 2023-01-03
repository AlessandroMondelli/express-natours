const User = require('./../models/userModel');
const asyncErrCheck = require('./../utils/asyncErr');

//Metodo che crea l'user
exports.signupUser = asyncErrCheck(async (req, res, next) => {
  //Creo user passando come parametro il body della richiesta
  const newUser = await User.create(req.body);

  //Invio risposta
  res.status(201).json({
    status: 'success',
    message: 'User successfully created',
    data: {
      user: newUser,
    },
  });
});
