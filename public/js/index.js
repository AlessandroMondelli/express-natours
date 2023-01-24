/* eslint-disable */
import { login, logout } from './login';
import { createMap } from './mapbox';
import { updateAccount } from './updateAccount';
import { updatePassword } from './updatePassword';

//Recupero bottone logout
const logoutBtn = document.querySelector('.nav__el--logout');

//Recupero dati ad invio del form
const loginForm = document.querySelector('.login-form .form');

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

if (mapDocument) {
  //Se esiste, recupero locations da tour.pug
  const locations = JSON.parse(mapDocument.dataset.locations);
  createMap(locations);
}

if (updateUserForm) {
  updateUserForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    updateAccount(username, email);
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    await updatePassword(oldPassword, newPassword, confirmPassword);

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';

    document.querySelector('.btn--save-password').textContent = 'Save password';
  });
}
