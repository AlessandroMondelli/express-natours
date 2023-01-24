/* eslint-disable */
import mapboxgl from 'mapbox-gl';

export const createMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYW1kZXYtaXQiLCJhIjoiY2xkOHA3cjRkMDE2ejN1b2ZiMTVyMzlvNiJ9.el2aRA6m_FAPWIJZQpS2Iw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
  });

  //Aggiungo limiti mappa
  const bounds = new mapboxgl.LngLatBounds();

  //Itero locations
  locations.forEach((loc) => {
    //Creo marcatore
    const el = document.createElement('div');
    el.className = 'marker';

    //Aggiungo marcatore
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Aggiungo popup a marker
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}`)
      .addTo(map);

    //Estendo limiti mappa per includere posizione attuale
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      right: 100,
      left: 100,
    },
  });
};
