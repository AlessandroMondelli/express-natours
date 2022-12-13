const dotenv = require('dotenv');
const app = require('./app'); //Importo app

dotenv.config({ path: './config.env' });

//START SERVER
const port = process.env.port * 1;
app.listen(port, () => {
  console.log(`In ascolto nella porta ${port}`);
});
