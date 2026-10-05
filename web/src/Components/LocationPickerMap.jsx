import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../Utils/googleMapsLoader';
import { Search, MapPin, Loader2, AlertTriangle, Key } from 'lucide-react';

const SRI_LANKA_CITIES = [
  { name: 'Kurunegala', lat: 7.4863, lng: 80.3647 },
  { name: 'Kandy', lat: 7.2906, lng: 80.6337 },
  { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
  { name: 'Galle', lat: 6.0535, lng: 80.2210 },
  { name: 'Jaffna', lat: 9.6615, lng: 80.0255 },
  { name: 'Trincomalee', lat: 8.5874, lng: 81.2152 },
  { name: 'Anuradhapura', lat: 8.3114, lng: 80.4037 },
  { name: 'Malabe (SLIIT)', lat: 6.9147, lng: 79.9729 }
];

const LocationPickerMap = ({ lat, lng, onChange }) => {
  const mapContainerRef = useRef(null);
  const googleMapRef = useRef(null);
  const googleMarkerRef = useRef(null);
  const infoWindowRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    window.__googleMapsAuthFailureHandler = () => {
      setLoadError(
        'Google Maps API Key error: The key is invalid, restricted, or Maps JavaScript API is not enabled.'
      );
    };

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!mapContainerRef.current) return;

        const initialLat = parseFloat(lat) || 7.4863;
        const initialLng = parseFloat(lng) || 80.3647;
        const pos = { lat: initialLat, lng: initialLng };

        if (!googleMapRef.current) {
          const map = new maps.Map(mapContainerRef.current, {
            center: pos,
            zoom: 12,
            mapTypeId: 'roadmap',
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          });

          const infoWindow = new maps.InfoWindow({
            content: `<b>Selected Location</b><br/>Lat: ${initialLat.toFixed(5)}<br/>Lng: ${initialLng.toFixed(5)}`
          });

          const MarkerClass = maps.Marker || (maps.marker && maps.marker.Marker);
          const marker = new MarkerClass({
            position: pos,
            map: map,
            draggable: true,
            title: 'Selected Hub Location'
          });

          infoWindow.open(map, marker);

          marker.addListener('dragend', () => {
            const position = marker.getPosition();
            const newLat = position.lat().toFixed(6);
            const newLng = position.lng().toFixed(6);
            infoWindow.setContent(`<b>Selected Location</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`);
            infoWindow.open(map, marker);
            onChange(newLat, newLng);
          });

          map.addListener('click', (e) => {
            const newLat = e.latLng.lat().toFixed(6);
            const newLng = e.latLng.lng().toFixed(6);
            marker.setPosition(e.latLng);
            infoWindow.setContent(`<b>Selected Location</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`);
            infoWindow.open(map, marker);
            onChange(newLat, newLng);
          });

          googleMapRef.current = map;
          googleMarkerRef.current = marker;
          infoWindowRef.current = infoWindow;
        }
        setMapLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to initialize Google Maps in LocationPickerMap:', err);
        setLoadError(err.message || 'Failed to load Google Maps.');
      });

    return () => {
      window.__googleMapsAuthFailureHandler = null;
    };
  }, []);

  useEffect(() => {
    const currentLat = parseFloat(lat);
    const currentLng = parseFloat(lng);
    if (isNaN(currentLat) || isNaN(currentLng)) return;

    if (mapLoaded && googleMapRef.current && googleMarkerRef.current && window.google) {
      const existingPos = googleMarkerRef.current.getPosition();
      if (existingPos) {
        const isDifferent =
          Math.abs(existingPos.lat() - currentLat) > 0.00001 ||
          Math.abs(existingPos.lng() - currentLng) > 0.00001;

        if (isDifferent) {
          const newPos = { lat: currentLat, lng: currentLng };
          googleMarkerRef.current.setPosition(newPos);
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(`<b>Selected Location</b><br/>Lat: ${currentLat.toFixed(5)}<br/>Lng: ${currentLng.toFixed(5)}`);
          }
          googleMapRef.current.panTo(newPos);
        }
      }
    }
  }, [lat, lng, mapLoaded]);

  const handleCitySelect = (city) => {
    setSearchError('');
    const newLat = city.lat.toFixed(6);
    const newLng = city.lng.toFixed(6);
    onChange(newLat, newLng);

    if (mapLoaded && googleMapRef.current && googleMarkerRef.current && window.google) {
      const pos = { lat: city.lat, lng: city.lng };
      googleMapRef.current.setCenter(pos);
      googleMapRef.current.setZoom(13);
      googleMarkerRef.current.setPosition(pos);
      if (infoWindowRef.current) {
        infoWindowRef.current.setContent(`<b>${city.name}</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`);
        infoWindowRef.current.open(googleMapRef.current, googleMarkerRef.current);
      }
    }
  };

  const handleSearchLocation = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError('');

    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const newLat = location.lat().toFixed(6);
            const newLng = location.lng().toFixed(6);

            onChange(newLat, newLng);
            if (googleMapRef.current && googleMarkerRef.current) {
              googleMapRef.current.setCenter(location);
              googleMapRef.current.setZoom(14);
              googleMarkerRef.current.setPosition(location);
              if (infoWindowRef.current) {
                infoWindowRef.current.setContent(`<b>${results[0].formatted_address}</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`);
                infoWindowRef.current.open(googleMapRef.current, googleMarkerRef.current);
              }
            }
          } else {
            setSearchError(`Location search failed: ${status}`);
          }
          setSearching(false);
        });
        return;
      } catch (err) {
        console.error('Google Geocoder failed:', err);
        setSearchError('Error performing location search.');
        setSearching(false);
      }
    } else {
      setSearchError('Google Maps geocoder not available.');
      setSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-charcoal flex items-center gap-1.5">
          <MapPin size={14} className="text-forest" /> Pick Hub Location on Map
        </label>
        <span className="text-[10px] text-forest font-semibold bg-forest/10 px-2 py-0.5 rounded-full border border-forest/20">
          Google Maps
        </span>
      </div>

      <p className="text-[11px] text-charcoal-light">
        Click anywhere on map or drag marker to set GPS coordinates.
      </p>

      {/* Location Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search town, city or address in Sri Lanka…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSearchLocation(e);
              }
            }}
            className="w-full pl-8 pr-3 py-1.5 border border-forest/20 rounded-xl text-xs bg-white focus:outline-none focus:border-forest"
          />
          <Search size={14} className="absolute left-2.5 top-2 text-forest/40" />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSearchLocation(e);
          }}
          disabled={searching || !!loadError}
          className="px-3 py-1.5 bg-forest hover:bg-forest-light text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50"
        >
          {searching ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
        </button>
      </div>

      {searchError && (
        <p className="text-[11px] text-red-500 font-medium">{searchError}</p>
      )}

      {/* Preset Quick Cities */}
      <div className="flex flex-wrap items-center gap-1 pb-1">
        <span className="text-[10px] text-charcoal-light font-medium">Quick Jump:</span>
        {SRI_LANKA_CITIES.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => handleCitySelect(city)}
            disabled={!!loadError}
            className="text-[10px] font-semibold bg-white hover:bg-forest hover:text-white text-forest px-2 py-0.5 rounded-lg border border-forest/20 transition-colors shadow-2xs disabled:opacity-50"
          >
            {city.name}
          </button>
        ))}
      </div>

      <div className="relative w-full h-56 rounded-xl border border-forest/30 shadow-inner overflow-hidden">
        {loadError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-amber-50 text-amber-900 text-xs text-center font-medium gap-2">
            <AlertTriangle size={24} className="text-amber-600 shrink-0" />
            <p className="text-[11px] font-semibold">{loadError}</p>
            <p className="text-[10px] text-amber-700">Please provide a valid key in <code className="font-mono bg-amber-100 px-1 rounded text-forest">web/.env</code></p>
          </div>
        ) : (
          <div
            ref={mapContainerRef}
            className="w-full h-full z-0"
          />
        )}
      </div>
    </div>
  );
};

export default LocationPickerMap;
