const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json()); //Dichiaro middleware

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')); //Ricevo dati da file, trasformando da JSON a JS

app.get('/api/v1/tours', (req, res) => { //Preparo operazione get per far leggere dati al client
    res.status(200).json(
        {
            'status': 'success',
            'elements': tours.length,
            'data': {
                tours
            }
        }
    );
});

app.get('/api/v1/tours/:id', (req, res) => { //Preparo operazione get per far leggere dati al client
    const id = req.params.id * 1; //Recupero id da url e lo trasformo in numero
    const tour = tours.find(el => el.id === id);

    if(!tour) {
        return res.status(404).json(
            {
                'status': 'fail',
                'message': 'Invalid ID'
            }
        );
    }

    res.status(200).json(
        {
            'status': 'success',
            'data': {
                tour
            }
        }
    );
});

app.post('/api/v1/tours', (req, res) => {
    const id = tours[tours.length - 1].id + 1; //Recupero id da ultimo elemento dell'oggetto
    const newTour = Object.assign( //Faccio merge di due oggetti per unire nuovo id a corpo della richiesta
        { 'id': id }, 
        req.body
    );

    tours.push(newTour); //Aggiungo ad array di oggetti tours il nuovo tour

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => { //Scrivo su file trasformando in JSON l'oggetto che abbiamo creato
        res.status(201).json({
            'status': 'success',
            'data': {
                'tour': newTour
            }
        });
    })
});

const port = 3000;
app.listen(port, () => {
    console.log(`In ascolto nella porta ${port}`);
});