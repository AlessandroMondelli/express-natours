/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export class AdminCrud {
  constructor(elId) {
    this.id = elId !== undefined ? elId : '';
  }

  async createEl(context, data) {
    try {
      await axios({
        method: 'POST',
        url: `/api/v1/${context}/`,
        data,
      });

      showAlert('success', 'Element created successfully.');
    } catch (err) {
      showAlert('error', `Error occurred while creating this element`);
    }
  }

  async editEl(context, data) {
    try {
      await axios({
        method: 'PATCH',
        url: `/api/v1/${context}/${this.id}`,
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
        url: `/api/v1/${context}/${this.id}`,
      });

      showAlert('success', 'Element deleted successfully.');
    } catch (err) {
      showAlert('error', `Error occurred while deleting this element`);
    }
  }
}
