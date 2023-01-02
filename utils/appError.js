//Classe che gestisce errori
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //Passo messaggio a classe padre, richiamandola

    this.statusCode = statusCode; //Salvo statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; //Recupero stato in base a numero iniziale di statusCode
    this.isOperational = true; //Variabile per controllare che l'errore sia di tipo operazionale

    Error.captureStackTrace(this, this.constructor); //Richiamo metodo di classe padre per recuperare la Stack Trace
  }
}

module.exports = AppError;
