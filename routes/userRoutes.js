const express = require('express');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');

//Creo router
const router = express.Router();

//Auth Routes
router.post('/signup', authController.signupUser);
router.post('/login', authController.login);

//Me Route
router.get(
  '/me',
  authController.protectRoute,
  usersController.getMe,
  usersController.getUser
);

//Routes Rigenerazione password
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch(
  '/update-password',
  authController.protectRoute,
  authController.updatePassword
);

//Route modifica dati utente
router.patch(
  '/update-me',
  authController.protectRoute,
  usersController.updateCurrentUser
);

//Route eliminazione utente
router.delete(
  '/delete-me',
  authController.protectRoute,
  usersController.deleteCurrentUser
);

//Users Routes
router
  .route('/')
  .get(usersController.getUsers)
  .post(usersController.createUser);
router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.patchUser)
  .delete(usersController.deleteUser);

module.exports = router;
