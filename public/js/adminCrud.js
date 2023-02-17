/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export class adminCrud {
  constructor(elId) {
    this.id = elId;
  }

  async editTour(context, data) {
    try {
      await axios({
        method: 'PATCH',
        url: `http://localhost:3000/api/v1/${context}/${this.id}`,
        data,
      });

      showAlert('success', 'Element edited successfully.');
    } catch (err) {
      showAlert('error', `Error occurred while editing this element`);
    }
  }

  async deleteEl(context) {
    try {
      await axios({
        method: 'DELETE',
        url: `http://localhost:3000/api/v1/${context}/${this.id}`,
      });

      showAlert('success', 'Element deleted successfully.');
    } catch (err) {
      showAlert('error', `Error occurred while deleting this element`);
    }
  }
}
