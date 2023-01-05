const express = require('express');
const usersController = require('../controllers/userController');
const authController = require('../controllers/authController');

//Creo router
const router = express.Router();

//Auth Routes
router.post('/signup', authController.signupUser);
router.post('/login', authController.login);

//Routes Rigenerazione password
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

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
