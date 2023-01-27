/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51MUpXcGNQpU4yYkjhZt3IFrJfOkFQysKJpIFH9qfAE1qfpzKXa9Lcui39gIm6wUtSFJPDgqXzTPnnRorfGVlbp4V00LS0o77pN'
    );

    //Recupero sessione da backend
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout/${tourId}`
    );
    console.log(session);

    //Creo form checkout + pagamento
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
