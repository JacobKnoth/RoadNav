import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { Popup, useMapEvents } from 'react-leaflet';


export default function MapView({ markers, polylines, selectedRoad,onSelectRoad }) {
  return (
    <MapContainer
      center={[37.77, -122.42]}
      zoom={13}
      style={{ height: '80vh', width: '100%' }}
    >
      <ClearPopupOnClick onClear={onSelectRoad} />

      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markers.map((m, i) => <Marker key={i} position={m} />)}
      {polylines.map((line, i) => (
        <Polyline
          key={i}
          positions={line}
          pathOptions={{ color: 'orange', weight: 5 }}
          eventHandlers={{
            click: () => {
              console.log('Polyline clicked:', i);
              if (onSelectRoad) {
                onSelectRoad({ id: i, positions: line });
              }
            }
          }}
          
        />
      ))}
      console.log('Selected road:', selectedRoad);
      {selectedRoad && (
        <Popup position={selectedRoad.positions[0]}>
          <div>
            <strong>East Fork Road</strong><br />
            Curvature: 4,797 (320/km)<br />
            Length: 15 km<br />
            Highway: residential<br />
            Speed Limit: unknown<br />
            Surface: paved<br />
            Smoothness: unknown<br />
            <hr />
            <a href="#">View or Edit</a>
          </div>
        </Popup>
      )}


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
function ClearPopupOnClick({ onClear }) {
  useMapEvents({
    click() {
      onClear(null);
    }
  });
  return null;
}