import axios from 'axios';
import { showAlert } from './alerts';

export const addBookmarkToUser = async (tourId) => {
  try {
    await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/add-bookmark`,
      data: { tourId },
    });

    showAlert('success', 'Tour added to bookmarks.');
  } catch (err) {
    showAlert('error', `Error, ${err}`);
  }
};
