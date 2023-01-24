/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    //Chiamata axios a API
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    //Se la richiesta ha avuto successo reindirizzo utente
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    //Chiamata axios a API
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    //Se la richiesta ha avuto successo reindirizzo utente
    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
