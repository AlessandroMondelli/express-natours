const express = require('express');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

//Creo router
const router = express.Router();

//Auth Routes
router.post('/signup', authController.signupUser);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

//Routes Rigenerazione password
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

//Aggiungo middleware a router per proteggere ogni altra chiamata
router.use(authController.protectRoute);

router.patch('/update-password', authController.updatePassword);

//Me Route
router.get('/me', usersController.getMe, usersController.getUser);

//Route modifica dati utente
router.patch(
  '/update-me',
  usersController.uploadUserPhoto,
  usersController.resizeUserPhoto,
  usersController.updateCurrentUser
);

//Route eliminazione utente
router.delete('/delete-me', usersController.deleteCurrentUser);

//Aggiungo middleware per funzioni admin
router.use(authController.restrictTo('admin'));

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

//Route che prende prenotazioni in base all'utente
router
  .route('/:id/bookings')
  .get(authController.protectRoute, bookingController.getBookingsByTour);

module.exports = router;
