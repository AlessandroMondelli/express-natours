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
  .then((connection) => {
    console.log('Connessione avvenuta a MongoDB con Mongoose');
    console.log(connection);
  });

//Creo nuovo schema Mongoose per tours
const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'The tour must have a price'],
  },
});

//Creo Model per tour
const Tour = mongoose.model('Tour', tourSchema);

//Creo elemento da salvare in database
const newTour = new Tour({
  name: "Giro turistico a Porto Sant'Elpidio",
  rating: 4,
  price: 14,
});

//Salvo nuovo valore in DB
newTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log(err);
  });

//START SERVER
const port = process.env.PORT * 1;
app.listen(port, () => {
  console.log(`In ascolto nella porta ${port}`);
});
