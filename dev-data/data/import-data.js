const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

//Includo dati del file env
dotenv.config({ path: '../../config.env' });

//Recupero stringa per connessione a DB
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//Connetto al Database
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connessione a DB da file import avvenuta con successo');
  })
  .catch((err) => {
    console.log(`Errore connessione DB: ${err}`);
  });

//Salvo in costante dati da file JSON
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//Funzione che importa dati da collection Tours nel DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Dati importati correttamente');
  } catch (err) {
    console.log(`Errore nell'import del file: ${err}`);
  }

  process.exit();
};

//Funzione che svuota dati da collection Tours DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Dati eliminati correttamente');
  } catch (err) {
    console.log(`Errore nella cancellazione dei dati: ${err}`);
  }

  process.exit();
};

//In base a richiesta importo o elimino dati
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
