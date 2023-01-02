const mongoose = require('mongoose'); //Importo Mongoose
const dotenv = require('dotenv'); //Importo dipendenza per env
const app = require('./app'); //Importo app

dotenv.config({ path: './config.env' });

//Handler per exceptions in codice sincrono
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);

  //Termino processo
  process.exit(1);
});

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
const server = app.listen(port, () => {
  console.log(`Modalità ambiente: ${process.env.NODE_ENV}`);
  console.log(`In ascolto nella porta ${port}`);
});

//Handler per promises non risolte fuori da Express
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);

  //Aspetto che sia terminato il ciclo del server
  server.close(() => {
    //Poi chiudo il processo
    process.exit(1);
  });
});
