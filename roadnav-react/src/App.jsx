import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Toolbar from './components/Toolbar';
import MapView from './components/MapView';
import { geocode, fetchRoadLines } from './services/api';

export default function App() {
  const [map, setMap]         = useState(null);
  const [markers, setMarkers] = useState([]);
  const [polylines, setLines] = useState([]);

  /* helper: return current viewport or world */
  const bbox = () => {
    if (!map) return '-90,-180,90,180';
    const b = map.getBounds();
    return `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
  };

  async function handleAddresses(a, b) {
    try {
      const [m1, m2] = await Promise.all([geocode(a), geocode(b)]);
      setLines([]);              // clear road lines
      setMarkers([m1, m2]);
    } catch (err) {
      alert(err.message === 'notfound' ? 'Address not found.' : 'Network error.');
    }
  }

  async function handleRoad(name) {
    try {
      const lines = await fetchRoadLines(name, bbox());
      //setMarkers([]);            // clear any address markers
      setLines(lines);
    } catch (err) {
      alert(
        err.message === 'none'
          ? 'No ways found in current view.'
          : 'Overpass error or network issue.'
      );
    }
  }

  return (
    <>
      <Container className="pt-3">
        <h2 className="mb-3">RoadNav (React + Bootstrap)</h2>
        <Toolbar onAddresses={handleAddresses} onRoad={handleRoad} />
      </Container>

      <MapView
        markers={markers}
        polylines={polylines}
        onMapReady={setMap}      // passes map instance up
      />
    </>
  );
}
