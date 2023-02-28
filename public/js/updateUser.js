/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateUser = async (type, data) => {
  try {
    //definisco url in base a richiesta
    const url =
      type === 'data'
        ? '/api/v1/users/update-me/'
        : '/api/v1/users/update-password/';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    //Se la richiesta ha avuto successo reindirizzo utente
    if (res.data.status === 'success') {
      if (type === 'data') {
        showAlert('success', 'Account updated');
      } else if (type === 'password') {
        showAlert('success', 'Password updated');
      }
    }
  } catch (err) {
    showAlert('error', err);
  }
};
