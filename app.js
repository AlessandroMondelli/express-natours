const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

//1 - MIDDLEWARES
app.use(morgan('dev')); //Utilizzo middleware di terze parti per vedere in console la richiesta
app.use(express.json()); //Dichiaro middleware

app.use((req, res, next) => { //Test middleware personalizzato
    const middlewareCheck = "Nuovo middleware";
    req.middlewareCheck = middlewareCheck; //Aggiungo campo a richiesta

    next(); //Passo a prossimo middleware
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')); //Ricevo dati da file, trasformando da JSON a JS

//2 - ROUTE HANDLERS
const getTours = (req, res) => { //Assegno a costante funzione per recuperare tours
    res.status(200).json(
        {
            'status': 'success',
            'elements': tours.length,
            'data': {
                tours
            }
        }
    );
};

const getTour = (req, res) => { //Assegno a costante funzione per recuperare tour
    const id = req.params.id * 1; //Recupero id da url e lo trasformo in numero
    const tour = tours.find(el => el.id === id);

    if(!tour) {
        return res.status(404).json(
            {
                'status': 'fail',
                'message': 'Invalid ID',
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
};

const createTour = (req, res) => { //Assegno a costante funzione per creare tour
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
    });
};

const patchTour = (req, res) => {
    const id = req.params.id * 1; //Recupero id da url e lo trasformo in numero
    const tour = tours.find(el => el.id === id);

    if(!tour) {
        return res.status(404).json(
            {
                'status': 'fail',
                'message': 'Invalid ID'
            }
        )
    }

    res.status(200).json(
        {
            'status': 'success',
            'data': {
                tour
            }
        }
    )
};

const deleteTour = (req, res) => {
    if(req.params.id * 1 > tours.length) {
        return res.status(404).json(
            {
                'status': 'fail',
                'message': 'Invalid ID'
            }
        )
    }

    res.status(204).json(
        {
            'status': 'success',
            'data': null,
        }
    )
}

//Handlers users
const getUsers = (req, res) => {
    res.status(500).json( 
        {
            'status': 'fail',
            'message': 'Route in costruzione'
        }
    )
};

const createUser = (req, res) => {
    res.status(500).json( 
        {
            'status': 'fail',
            'message': 'Route in costruzione'
        }
    )
};

const getUser = (req, res) => {
    res.status(500).json( 
        {
            'status': 'fail',
            'message': 'Route in costruzione'
        }
    )
};
const patchUser = (req, res) => {
    res.status(500).json( 
        {
            'status': 'fail',
            'message': 'Route in costruzione'
        }
    )
};
const deleteUser = (req, res) => {
    res.status(500).json( 
        {
            'status': 'fail',
            'message': 'Route in costruzione'
        }
    )
};

//3 - ROUTES
//Creo nuovi routers
const tourRouter = express.Router();
const userRouter = express.Router();

//Routes tours
tourRouter.route('/').get(getTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(patchTour).delete(deleteTour);

//Routes users
userRouter.route('/users').get(getUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(patchUser).delete(deleteUser);

//Dichiaro middlewares per routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//4 - START SERVER
const port = 3000;
app.listen(port, () => {
    console.log(`In ascolto nella porta ${port}`);
});