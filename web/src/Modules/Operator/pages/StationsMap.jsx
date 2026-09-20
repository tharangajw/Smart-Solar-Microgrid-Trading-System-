import { useEffect, useMemo, useRef, useState } from 'react';
import { getAllStations } from '../../../Services/operatorApi';
import { useStationUpdates } from '../../../Hooks/useStationUpdates';

const loadGoogleMaps = (key) => new Promise((resolve, reject) => {
  if (window.google?.maps) return resolve(window.google.maps);
  const existing = document.querySelector('script[data-google-maps]');
  if (existing) { existing.addEventListener('load', () => resolve(window.google.maps)); existing.addEventListener('error', reject); return; }
  const script = document.createElement('script');
  script.dataset.googleMaps = 'true'; script.async = true; script.defer = true;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
  script.onload = () => resolve(window.google.maps); script.onerror = reject;
  document.head.appendChild(script);
});

export default function StationsMap() {
  const mapElement = useRef(null); const map = useRef(null);
  // useStationUpdates manages its own state & SignalR patches.
  // We seed it via setStations after the initial REST load.
  const [stations, setStations] = useStationUpdates();
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const visibleStations = useMemo(() => stations.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())), [stations, query]);

  // Initial REST load — runs once on mount
  useEffect(() => {
    getAllStations()
      .then((response) => { setStations(response.data); setLastUpdated(new Date()); setError(''); })
      .catch(() => setError('Unable to load stations. Check that the API is running.'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update "last updated" timestamp whenever SignalR patches a station
  useEffect(() => {
    if (stations.length > 0) setLastUpdated(new Date());
  }, [stations]);

  // Load Google Maps script once
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key || key === 'your_google_maps_api_key_here') { setError('Set VITE_GOOGLE_MAPS_API_KEY in .env to display the map.'); return; }
    loadGoogleMaps(key).then((maps) => { if (!map.current && mapElement.current) map.current = new maps.Map(mapElement.current, { center: { lat: 7.8731, lng: 80.7718 }, zoom: 7 }); }).catch(() => setError('Google Maps could not be loaded.'));
  }, []);

  // Re-draw markers whenever visible stations change
  useEffect(() => {
    if (!map.current || !window.google?.maps) return;
    const bounds = new window.google.maps.LatLngBounds();
    const markers = visibleStations.map((station) => {
      const marker = new window.google.maps.Marker({ map: map.current, position: { lat: station.latitude, lng: station.longitude }, title: station.name });
      marker.addListener('click', () => setSelected(station)); bounds.extend(marker.getPosition()); return marker;
    });
    if (markers.length) map.current.fitBounds(bounds);
    return () => markers.forEach((marker) => marker.setMap(null));
  }, [visibleStations]);

  return <div className="space-y-6 sm:space-y-8">
    <div className="flex items-end justify-between">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-forest">Stations Map</h1>
        <p className="text-sm text-charcoal-light mt-1">Live microgrid station availability · real-time via SignalR</p>
      </div>
      {lastUpdated && <span className="text-xs text-charcoal-light bg-forest/5 px-3 py-1 rounded-full">Updated {lastUpdated.toLocaleTimeString()}</span>}
    </div>
    
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a station" className="w-full max-w-md rounded-xl border border-forest/10 bg-ivory p-3 text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all" />
    
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div ref={mapElement} className="h-[560px] rounded-2xl border border-forest/10 shadow-sm" /> 
      <aside className="rounded-2xl bg-white border border-forest/5 p-6 shadow-sm">
        {selected ? <>
          <h2 className="font-display text-xl font-semibold text-forest">{selected.name}</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between border-b border-forest/5 pb-2">
              <dt className="text-charcoal-light font-medium">Location</dt>
              <dd className="text-charcoal font-semibold text-right max-w-[150px]">{selected.location}</dd>
            </div>
            <div className="flex justify-between border-b border-forest/5 pb-2">
              <dt className="text-charcoal-light font-medium">Capacity</dt>
              <dd className="text-charcoal font-semibold">{selected.capacityKWh} kWh</dd>
            </div>
            <div className="flex justify-between border-b border-forest/5 pb-2">
              <dt className="text-charcoal-light font-medium">Available slots</dt>
              <dd className="text-charcoal font-semibold">{selected.availableSlots} / {selected.totalSlots}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-charcoal-light font-medium">Status</dt>
              <dd className="capitalize text-forest font-semibold flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selected.status === 'Active' || selected.status === 'active' ? 'bg-leaf' : 'bg-red-400'}`}></span>
                {selected.status}
              </dd>
            </div>
          </dl>
        </> : <p className="text-sm text-charcoal-light text-center py-8">Select a station marker to view details.</p>}
      </aside>
    </div>
  </div>;
}
