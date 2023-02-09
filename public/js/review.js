/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const postReview = async (tour, rating, review) => {
  try {
    await axios({
      method: 'POST',
      url: `http://localhost:3000/api/v1/reviews`,
      data: {
        review,
        rating,
        tour,
      },
    });

    showAlert('success', 'Review saved successfully!');

    window.location.href = '/';
  } catch (err) {
    showAlert('error', `Error, ${err}`);
  }
};
