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

//Route che aggiunge tour preferito a User
router.route('/toggle-bookmark').patch(usersController.toggleBookmark);

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
  .patch(
    usersController.uploadUserPhoto,
    usersController.resizeUserPhoto,
    usersController.patchUser
  )
  .delete(usersController.deleteUser);

//Route che prende prenotazioni in base all'utente
router.route('/:id/bookings').get(bookingController.getBookingsByPar);

module.exports = router;
