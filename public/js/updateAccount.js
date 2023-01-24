/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateAccount = async (username, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:3000/api/v1/users/update-me/',
      data: {
        username,
        email,
      },
    });

    //Se la richiesta ha avuto successo reindirizzo utente
    if (res.data.status === 'success') {
      showAlert('success', 'Account updated');
    }
  } catch (err) {
    showAlert('error', err);
  }
};
