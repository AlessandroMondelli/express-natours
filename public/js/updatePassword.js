/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updatePassword = async (
  oldPassword,
  newPassword,
  newPasswordConfirm
) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:3000/api/v1/users/update-password/',
      data: {
        oldPassword,
        newPassword,
        newPasswordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Password updated correctly.');
    }
  } catch (err) {
    console.log(err.response.message);
    showAlert('error', 'An error occurred while updating the password. Retry.');
  }
};
