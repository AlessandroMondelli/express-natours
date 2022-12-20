class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1) FILTERING
    //Escludo parametri non inerenti a DB per Query
    //Hard save su nuovo oggetto per parametri query
    const toursQueryObj = { ...this.queryString };

    //Campi da escludere
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    //Elimino campi non necessari da query
    excludedFields.forEach((el) => delete toursQueryObj[el]);

    //Filtro avanzato
    //Trasformo in stringa nuovo oggetto
    let toursObjString = JSON.stringify(toursQueryObj);
    //Aggiungo simbolo $ per filtro avanzato
    toursObjString = toursObjString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    //Salvo query ritrasformandola in formato JSON
    this.query = this.query.find(JSON.parse(toursObjString));

    return this;
  }

  sort() {
    //2) SORT
    //Recupero da query l'ordinamento desiderato
    if (this.queryString.sort) {
      //Riformatto i metodi di ordinamento inserendo uno spazio
      const sortBy = this.queryString.sort.split(',').join(' ');
      //Utilizzo metodo .sort() per ordinare
      this.query = this.query.sort(sortBy);
    } else {
      //Se non viene richiesto un ordinamento, ordino per data di creazione o id (serve un valore unico come fallback)
      this.query = this.query.sort('-createdAt _id');
    }

    return this;
  }

  selectFields() {
    //3) LIMITING FIELDS
    //Permettiamo all'utente di ricevere i dati che vuole, non ritornando tutto il resto
    if (this.queryString.fields) {
      //Per Mongoose, trasformo divisori da virgola a spazio
      const fields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(fields);
    } else {
      //In caso non vengano scelti dei dati, nascondo comunque __v
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination(documentsCount) {
    //4) PAGINATION
    //Recupero pagina desiderata dall'utente o setto 1 di default
    const page = this.queryString.page * 1 || 1;
    //Recupero limite di elementi desiderati dall'utente o setto 100 di default
    const limit = this.queryString.limit * 1 || 100;
    //Calcolo valori da skippare
    const skip = (page - 1) * limit;

    //Modifico query con paginazione desiderata
    this.query = this.query.skip(skip).limit(limit);

    //Se viene inserita la pagina faccio controllo su skip
    if (this.queryString.page) {
      //Se skip è maggiore o uguale al numero dei documents invio un errore
      if (documentsCount <= skip) throw new Error('Page not found');
    }

    return this;
  }
}

module.exports = APIFeatures;
