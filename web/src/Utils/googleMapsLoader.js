import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let googleMapsPromise = null;

// Catch Google Maps API Authentication Failures (e.g. invalid key or unactivated Maps API)
if (typeof window !== 'undefined') {
  window.gm_authFailure = () => {
    console.error('Google Maps API Authentication Failed: Check VITE_GOOGLE_MAPS_API_KEY in web/.env');
    if (typeof window.__googleMapsAuthFailureHandler === 'function') {
      window.__googleMapsAuthFailureHandler();
    }
  };
}

/**
 * Safely loads Google Maps JavaScript API using the v2 functional API (setOptions + importLibrary).
 */
export const loadGoogleMaps = async (apiKey) => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in web/.env');
  }

  if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Map) {
    return window.google.maps;
  }

  if (!googleMapsPromise) {
    googleMapsPromise = (async () => {
      setOptions({
        key: apiKey.trim(),
        version: 'weekly',
      });

      await Promise.all([
        importLibrary('maps'),
        importLibrary('geocoding'),
        importLibrary('marker')
      ]);

      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        return window.google.maps;
      }
      throw new Error('Google Maps library failed to load.');
    })().catch((err) => {
      googleMapsPromise = null;
      throw err;
    });
  }

  return googleMapsPromise;
};
