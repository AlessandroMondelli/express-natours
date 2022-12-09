const app = require('./app'); //Importo app

//START SERVER
const port = 3000;
app.listen(port, () => {
    console.log(`In ascolto nella porta ${port}`);
});