import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
];

const LocationPickerMap = ({ lat, lng, onChange }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = parseFloat(lat) || 7.4863;
    const initialLng = parseFloat(lng) || 80.3647;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onChange(position.lat.toFixed(6), position.lng.toFixed(6));
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
      });

      mapRef.current = map;
      markerRef.current = marker;
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
      markerRef.current.setLatLng([currentLat, currentLng]);
      mapRef.current.panTo([currentLat, currentLng]);
    }
  }, [lat, lng]);

  const handleCitySelect = (city) => {
    onChange(city.lat.toString(), city.lng.toString());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-charcoal-light">
          Pick Station Location on Map (Click or Drag Marker)
        </label>
        <span className="text-[10px] text-forest font-semibold bg-forest/10 px-2 py-0.5 rounded">
          OpenStreetMap
        </span>
      </div>

      {/* Preset Quick Cities */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        <span className="text-[10px] text-charcoal-light font-medium">Quick Jump:</span>
        {SRI_LANKA_CITIES.map((city) => (
          <button
            key={city.name}
            type="button"
            onClick={() => handleCitySelect(city)}
            className="text-[10px] font-semibold bg-cream hover:bg-forest hover:text-white text-forest px-2 py-0.5 rounded-lg border border-forest/10 transition-colors"
          >
            {city.name}
          </button>
        ))}
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-52 rounded-xl border border-forest/20 shadow-inner z-0 overflow-hidden"
      />
    </div>
  );
};

export default LocationPickerMap;
