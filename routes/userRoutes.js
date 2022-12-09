const express = require('express');
const usersController = require('../controllers/userController');

//Creo router
const router = express.Router();

//Routes users
router.route('/').get(usersController.getUsers).post(usersController.createUser);
router.route('/:id').get(usersController.getUser).patch(usersController.patchUser).delete(usersController.deleteUser);

module.exports = router;