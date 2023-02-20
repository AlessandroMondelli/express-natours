/* eslint-disable */
import { login, logout, signUp } from './login';
import { createMap } from './mapbox';
import { updateUser } from './updateUser';
import { bookTour } from './stripe';
import { AdminCrud } from './adminCrud';
import { postReview, patchReview } from './review';
import { addBookmarkToUser } from './bookmark';

//Recupero bottone logout
const logoutBtn = document.querySelector('.nav__el--logout');

//Recupero form login
const loginForm = document.querySelector('.login-form .form');

//Recuper form sign up
const signUpForm = document.querySelector('.signup-form .form');

//Prendo elemento map
const mapDocument = document.getElementById('map');

//Prendo form aggiornamento account
const updateUserForm = document.querySelector('.form-user-data');

//Prendo form aggiornamento password
const updatePasswordForm = document.querySelector('.form-user-settings');

//Prendo elemento booking
const bookBtn = document.getElementById('book-tour');

//Prendo form modifica tour
const editTour = document.getElementById('edit-tour');

//Prendo form creazione user
const createUser = document.getElementById('create-user');

//Prendo form modifica user
const editUser = document.getElementById('edit-user');

//Prendo tasto eliminazione admin
const deleteBtn = document.getElementsByClassName('delete-el');

//Controllo esistenza reviews
const reviewSection = document.querySelector('.stars-wrap');

//Controllo esistenza bookmark
const bookmarkBtn = document.querySelector('.bookmark');

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Recupero dati
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    //Salvo dati
    signUp({ username, email, password, passwordConfirm });
  });
}

if (updateUserForm) {
  updateUserForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Ricreo form data per passare anche immagine
    const form = new FormData();
    form.append('username', document.getElementById('username').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateUser('data', form);
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    //modifico testo pulsante
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    //Recupero dati
    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    //Aggiorno dati
    await updateUser('password', { oldPassword, newPassword, confirmPassword });

    //Inizializzo form
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';

    document.querySelector('.btn--save-password').textContent = 'Save password';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    //Modifico testo pulsante
    e.target.textContent = 'Processing...';

    //Recupero tour id da dataset
    const { tourId } = e.target.dataset;

    //Recupero data scelta
    const dateSelect = document.getElementById('tour-dates');
    const date = dateSelect.options[dateSelect.selectedIndex].value;

    //Richiamo funzione per gestire checkout
    bookTour(tourId, date);
  });
}

if (mapDocument) {
  //Se esiste, recupero locations da tour.pug
  const locations = JSON.parse(mapDocument.dataset.locations);
  createMap(locations);
}

//Admin
if (editTour) {
  editTour.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tourId = document.getElementById('edit-submit').dataset.tourId;

    //Istanzio FormData per recuperare dati da form
    const formData = new FormData(editTour);

    //Preparo start location
    const startLocation = {
      type: 'Point',
      address: formData.get('address'),
      description: formData.get('locationDescription'),
    };

    formData.append(`startLocation.coordinates.0`, formData.get('longitude'));
    formData.append(`startLocation.coordinates.1`, formData.get('latitude'));

    Object.keys(startLocation).forEach((e) => {
      formData.append(`startLocation.${e}`, startLocation[e]);
    });

    //Preparo guide
    const guides = formData.getAll('guide');

    for (let guide of guides) {
      formData.append('guides[]', guide);
    }

    const admin = new AdminCrud();
    await admin.editEl('tours', formData, tourId);
  });
}

if (createUser) {
  createUser.addEventListener('submit', async (e) => {
    e.preventDefault();
    let dataObj = {};

    const formData = new FormData(createUser);

    for (const data of formData.entries()) {
      dataObj[data[0]] = data[1];
    }

    const admin = new AdminCrud();

    await admin.createEl('users', dataObj);
  });
}

if (editUser) {
  editUser.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('edit-submit').dataset.userId;

    //Istanzio formData per recuperare dati inviati
    const formData = new FormData(editUser);

    const admin = new AdminCrud();
    await admin.editEl('users', formData, userId);
  });
}

if (deleteBtn) {
  //Aggiungo listener a tutti gli elementi
  for (let i = 0; i < deleteBtn.length; i++) {
    deleteBtn[i].addEventListener('click', async (e) => {
      e.preventDefault();

      const elId = deleteBtn[i].dataset.elId;
      const path = deleteBtn[i].dataset.elPath;

      const admin = new AdminCrud(elId);

      await admin.deleteEl(path);
      deleteBtn[i].closest('.card').remove();
    });
  }
}

//Review tour
if (reviewSection) {
  //Classe per aggiungere e rimuovere classe da elemento
  const addRemoveClassToEl = (el, classToRemove, classToAdd) => {
    el.classList.remove(classToRemove);
    el.classList.add(classToAdd);
  };

  //Funzione che attiva stelle precedenti a selezionata
  const reviewStarsActive = (el, classToAdd) => {
    const currentStar = el.querySelector('.reviews__star');

    addRemoveClassToEl(currentStar, 'reviews__star--inactive', classToAdd);

    if (el.dataset.review > 1) {
      for (let i = el.dataset.review; i > 0; i--) {
        const prevEl = document
          .querySelector(`[data-review='${i}']`)
          .querySelector('.reviews__star');

        addRemoveClassToEl(prevEl, 'reviews__star--inactive', classToAdd);
      }
    }
  };

  const stars = document.getElementsByClassName('star');

  //Scorro elementi stelle
  Array.from(stars).forEach(function (element) {
    //Ad entrata mouse attivo
    element.addEventListener('mouseenter', (e) => {
      reviewStarsActive(element, 'reviews__star--active');
    });

    //Ad uscita disattivo
    element.addEventListener('mouseleave', (e) => {
      const elToDeactivate = document.getElementsByClassName('reviews__star');

      Array.from(elToDeactivate).forEach(function (element) {
        if (!element.classList.contains('reviews__star--active-clicked')) {
          addRemoveClassToEl(
            element,
            'reviews__star--active',
            'reviews__star--inactive'
          );
        }
      });
    });

    //A click passo valore stella in form
    element.addEventListener('click', function (e) {
      reviewStarsActive(element, 'reviews__star--active-clicked');

      //Setto valore rating
      document.getElementById('review-rating').value =
        e.target.closest('[data-review]').dataset.review;
    });
  });

  //salvo valore in db con chiamata ad API
  document.querySelector('.review-form').addEventListener('submit', (e) => {
    e.preventDefault();

    //Recupero dati review
    const rating = document.getElementById('review-rating').value;
    const review = document.getElementById('review-text').value;

    //Se si tratta di una PATCH request
    if (e.target.classList.contains('patch-review')) {
      const reviewId =
        document.getElementById('review-submit').dataset.reviewId;

      patchReview(reviewId, rating, review);
    } else {
      const tourId = document.getElementById('review-submit').dataset.tourId;

      postReview(tourId, rating, review);
    }
  });
}

if (bookmarkBtn) {
  bookmarkBtn.addEventListener('click', (e) => {
    const tourId = e.target.dataset.tourId;
    const booked = e.target.classList.contains('bookmarked') ? true : false;

    addBookmarkToUser(tourId, booked, e);
  });
}
