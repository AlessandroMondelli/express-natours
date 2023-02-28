import axios from 'axios';
import { showAlert } from './alerts';

export const addBookmarkToUser = async (tourId, booked, el) => {
  try {
    //Invio chiamata PATCH a route
    await axios({
      method: 'PATCH',
      url: `/api/v1/users/toggle-bookmark`,
      data: { tourId },
    });

    //Se il tour era già salvato
    if (booked) {
      showAlert('success', 'Tour removed from bookmarks.');

      //Elimino classe
      el.target.classList.remove('bookmarked');
    } else {
      showAlert('success', 'Tour added to bookmarks.');

      //Aggiungo classe
      el.target.classList.add('bookmarked');
    }
  } catch (err) {
    showAlert('error', `Error, ${err}`);
  }
};
