/* eslint-disable */
//Funzione che rimuove alert
export const hideAlert = () => {
  if (document.querySelector('.alert')) {
    document.querySelector('.alert').remove();
  }
};

//Funzione che mostra alert
export const showAlert = (stat, msg) => {
  hideAlert();

  //Creo html
  const markup = `<div class="alert alert--${stat}">${msg}</div>`;
  //Inserisco html
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  //Nascondo alert dopo 2 secondi
  window.setTimeout(hideAlert, 3000);
};
