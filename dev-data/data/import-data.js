const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

//Includo dati del file env
dotenv.config({ path: './config.env' });

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

//Funzione che importa dati da collection Tours nel DB
const importData = async () => {
  try {
    await Tour.create(tours);
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
