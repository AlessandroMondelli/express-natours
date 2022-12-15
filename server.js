const mongoose = require('mongoose'); //Importo Mongoose
const dotenv = require('dotenv'); //Importo dipendenza per env
const app = require('./app'); //Importo app

dotenv.config({ path: './config.env' });

//Recupero dati database da file env
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//Mi connetto al database remoto di MongoDB
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connessione avvenuta con successo a MongoDB con Mongoose');
  });

//START SERVER
const port = process.env.PORT * 1;
app.listen(port, () => {
  console.log(`In ascolto nella porta ${port}`);
});
