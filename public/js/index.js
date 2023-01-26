/* eslint-disable */
import { login, logout, signUp } from './login';
import { createMap } from './mapbox';
import { updateUser } from './updateUser';

//Recupero bottone logout
const logoutBtn = document.querySelector('.nav__el--logout');

//Recupero form login
const loginForm = document.querySelector('.login-form .form');

//Recuper form sign up
const signUpForm = document.querySelector('.signup-form .form');

//Prendo elemento map
const mapDocument = document.getElementById('map');

//Prendo form aggiornamento account
const updateUserForm = document.querySelector('.form-user-data');

//Prendo form aggiornamento password
const updatePasswordForm = document.querySelector('.form-user-settings');

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Recupero dati
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    //Salvo dati
    signUp({ username, email, password, passwordConfirm });
  });
}

if (mapDocument) {
  //Se esiste, recupero locations da tour.pug
  const locations = JSON.parse(mapDocument.dataset.locations);
  createMap(locations);
}

if (updateUserForm) {
  updateUserForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Ricreo form data per passare anche immagine
    const form = new FormData();
    form.append('username', document.getElementById('username').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateUser('data', form);
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    //modifico testo pulsante
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    //Recupero dati
    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    //Aggiorno dati
    await updateUser('password', { oldPassword, newPassword, confirmPassword });

    //Inizializzo form
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';

    document.querySelector('.btn--save-password').textContent = 'Save password';
  });
}
