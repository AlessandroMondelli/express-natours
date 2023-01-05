const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'The password is not optional!'],
    minLength: [8, 'The password must contain 8 characters at least'],
    trim: true,
    select: false,
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpire: Date,
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

//Salvo data ultima modifica della password
userSchema.pre('save', function (next) {
  //Se non è stata modificata la password o si tratta di un nuovo record salto al prossimo middleware
  if (!this.isModified('password') || this.isNew) return next();

  //Altrimenti salvo data attuale, con 1 secondo nel passato perché altrimenti verrebbe creato prima il JWT rendendolo nullo
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

//Instance method per confrontare password criptata con quella del login
userSchema.methods.passwordCheck = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

//Instance method per confrontare data JWT a data cambio password
userSchema.methods.checkNewPasswordDate = function (jwtDate) {
  if (this.passwordChangedAt) {
    //Converto data password per confrontare con quella del token
    const convertedNewPasswordDate = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    //Se la data è più recente, allora ritorno true
    return convertedNewPasswordDate > jwtDate;
  }

  return false;
};

//Instance method che genera token per richiesta rigenerazione password
userSchema.methods.createResetPasswordToken = function () {
  //Genero stringa token
  const resetToken = crypto.randomBytes(32).toString('hex');

  //Cripto il token per salvarlo nel db
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //Setto una scadenza al token a 10 minuti
  this.passwordResetTokenExpire = Date.now() + 75 * 60 * 1000;
  return resetToken;
};

//Creo model
const User = mongoose.model('User', userSchema);

module.exports = User; //Esporto modello user
