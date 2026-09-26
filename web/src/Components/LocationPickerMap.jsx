import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Loader2 } from 'lucide-react';

// Fix Leaflet default marker icon paths in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = parseFloat(lat) || 7.4863;
    const initialLng = parseFloat(lng) || 80.3647;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
      marker.bindPopup(`<b>Selected Location</b><br/>Lat: ${initialLat.toFixed(5)}<br/>Lng: ${initialLng.toFixed(5)}`);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        const newLat = position.lat.toFixed(6);
        const newLng = position.lng.toFixed(6);
        marker.setPopupContent(`<b>Selected Location</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`).openPopup();
        onChange(newLat, newLng);
      });

      map.on('click', (e) => {
        const newLat = e.latlng.lat.toFixed(6);
        const newLng = e.latlng.lng.toFixed(6);
        marker.setLatLng(e.latlng);
        marker.setPopupContent(`<b>Selected Location</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`).openPopup();
        onChange(newLat, newLng);
      });

      mapRef.current = map;
      markerRef.current = marker;

      // Invalidate size to ensure Leaflet renders all tiles properly inside dynamic modals
      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 250);

      return () => clearTimeout(timer);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const currentLat = parseFloat(lat);
    const currentLng = parseFloat(lng);
    if (!isNaN(currentLat) && !isNaN(currentLng) && mapRef.current && markerRef.current) {
      const existingPos = markerRef.current.getLatLng();
      const isDifferent =
        Math.abs(existingPos.lat - currentLat) > 0.00001 ||
        Math.abs(existingPos.lng - currentLng) > 0.00001;

      if (isDifferent) {
        const newLatLng = [currentLat, currentLng];
        markerRef.current.setLatLng(newLatLng);
        markerRef.current.setPopupContent(`<b>Selected Location</b><br/>Lat: ${currentLat.toFixed(5)}<br/>Lng: ${currentLng.toFixed(5)}`);
        mapRef.current.panTo(newLatLng);
      }
    }
  }, [lat, lng]);

  const handleCitySelect = (city) => {
    setSearchError('');
    const newLat = city.lat.toFixed(6);
    const newLng = city.lng.toFixed(6);
    onChange(newLat, newLng);
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([city.lat, city.lng], 13);
      markerRef.current.setLatLng([city.lat, city.lng]);
      markerRef.current.setPopupContent(`<b>${city.name}</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`).openPopup();
    }
  };

  const handleSearchLocation = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError('');

    try {
      // Free OpenStreetMap Nominatim Search API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const target = results[0];
        const newLat = parseFloat(target.lat).toFixed(6);
        const newLng = parseFloat(target.lon).toFixed(6);

        onChange(newLat, newLng);

        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([parseFloat(target.lat), parseFloat(target.lon)], 14);
          markerRef.current.setLatLng([parseFloat(target.lat), parseFloat(target.lon)]);
          markerRef.current.setPopupContent(
            `<b>${target.display_name.split(',')[0]}</b><br/>Lat: ${newLat}<br/>Lng: ${newLng}`
          ).openPopup();
        }
      } else {
        setSearchError('Location not found. Try clicking on map directly.');
      }
    } catch (err) {
      setSearchError('Could not reach search service. Click map to place marker.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-charcoal flex items-center gap-1.5">
          <MapPin size={14} className="text-forest" /> Pick Hub Location on OpenStreetMap
        </label>
        <span className="text-[10px] text-forest font-semibold bg-forest/10 px-2 py-0.5 rounded-full border border-forest/20">
          OpenStreetMap
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
          disabled={searching}
          className="px-3 py-1.5 bg-forest hover:bg-forest-light text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 shrink-0"
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
            className="text-[10px] font-semibold bg-white hover:bg-forest hover:text-white text-forest px-2 py-0.5 rounded-lg border border-forest/20 transition-colors shadow-2xs"
          >
            {city.name}
          </button>
        ))}
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-56 rounded-xl border border-forest/30 shadow-inner z-0 overflow-hidden"
      />
    </div>
  );
};

export default LocationPickerMap;

