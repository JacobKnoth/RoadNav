import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';

export default function MapView({ markers, polylines }) {
  return (
    <MapContainer 
        center={[37.77, -122.42]} 
        zoom={13} 
        style={{ height: '80vh', width: '100%' }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markers.map((m, i) => <Marker key={i} position={m} />)}
      {polylines.map((line, i) => (
        <Polyline key={i} positions={line} pathOptions={{ color: 'orange', weight: 5 }} />
      ))}
      <FitAll markers={markers} polylines={polylines} />
    </MapContainer>
  );
}

/* auto‑fit when data changes */
function FitAll({ markers, polylines }) {
  const map = useMap();
  useEffect(() => {
    const latlngs = [...markers, ...polylines.flat()];
    if (latlngs.length) {
      map.fitBounds(latlngs, { padding: [40, 40] });
    }
  }, [markers, polylines, map]);
  return null;
}

