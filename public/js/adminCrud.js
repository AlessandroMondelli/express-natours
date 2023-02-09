/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export class adminCrud {
  constructor(elId) {
    this.id = elId;
  }

  async deleteEl() {
    try {
      await axios({
        method: 'DELETE',
        url: `http://localhost:3000/api/v1/tours/${this.id}`,
      });

      showAlert('success', 'Element deleted successfully.');
    } catch (err) {
      showAlert('error', `Error occurred while deleting the element`);
    }
  }
}
