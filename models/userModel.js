const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//Schema per Model User
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, 'The user must have an username'],
    unique: true,
    minLength: [5, 'The username must have more than 4 characters '],
    maxLength: [15, "The username can't contain more than 15 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'The user must have an email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Provide a valid email'],
  },
  photo: {
    type: String,
    required: [true, 'The user must have a photo'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'The password is not optional!'],
    minLength: [8, 'The password must contain 8 characters at least'],
    trim: true,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, confirm your password'],
    //La validazione funziona solo per CREATE e SAVE
    validate: function (val) {
      return val === this.password;
    },
    trim: true,
  },
});

//Encryption delle password prima del salvataggio
userSchema.pre('save', async function (next) {
  //Controllo se l'utente vuole modificare la password
  if (!this.isModified('password')) return next();

  //Cripto password
  this.password = await bcrypt.hash(this.password, 12);

  //Setto conferma password ad undefined
  this.passwordConfirm = undefined;

  next();
});

//Creo model
const User = mongoose.model('User', userSchema);

module.exports = User; //Esporto modello user
