//Modulo che gestisce errori per funzioni asincrone
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //Assegno next a catch per passare al middleware dell'errorHandler
  };
};
