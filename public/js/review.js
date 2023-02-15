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

export const patchReview = async (reviewId, rating, review) => {
  try {
    await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/reviews/${reviewId}`,
      data: {
        review,
        rating,
      },
    });

    showAlert('success', 'Review edited successfully!');
  } catch (err) {
    showAlert('error', `Error, ${err}`);
  }
};
