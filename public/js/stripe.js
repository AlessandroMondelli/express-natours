/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId, date) => {
  try {
    //Formatto data per passarla in parametro
    const newDate = new Date(date);
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    const day = newDate.getDate();

    const stripe = Stripe(
      'pk_test_51MUpXcGNQpU4yYkjhZt3IFrJfOkFQysKJpIFH9qfAE1qfpzKXa9Lcui39gIm6wUtSFJPDgqXzTPnnRorfGVlbp4V00LS0o77pN'
    );

    //Recupero sessione da backend
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout/${tourId}/date/${year}-${month}-${day}`
    );

    if (session.data.session !== undefined) {
      //Creo form checkout + pagamento
      await stripe.redirectToCheckout({
        sessionId: session.data.session.id,
      });
    } else {
      window.location.href = '/';
    }
  } catch (err) {
    showAlert('error', err);
  }
};
