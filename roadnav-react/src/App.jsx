import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Toolbar from './components/Toolbar';
import MapView from './components/MapView';
import AuthButtons from './components/AuthButtons';
import { geocode, fetchRoadLines , fetchRoute} from './services/api';
import './App.css';


export default function App() {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [polylines, setLines] = useState([]);
  const [selectedRoad, setSelectedRoad] = useState(null);


  /* return current viewport or world */
  const bbox = () => {
    if (!map) return '-90,-180,90,180';
    const b = map.getBounds();
    return `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
  };

  async function handleAddresses(a, b) {
    try {
      const [m1, m2] = await Promise.all([geocode(a), geocode(b)]);
      // setLines([]);              // clear road lines
      setMarkers([m1, m2]);
      const route = await fetchRoute(m1, m2);
      setLines([route]);
    } catch (err) {const route = await fetchRoute(m1, m2);
+    setLines([route]);
      alert(err.message === 'notfound' ? 'Address not found.' : 'Network error.');
    }
  }

  async function handleRoad(name) {
    try {
      const lines = await fetchRoadLines(name, bbox());
      //setMarkers([]);            // clear any address markers
      setLines(prev => [...prev, ...lines]);
    } catch (err) {
      alert(
        err.message === 'none'
          ? 'No ways found in current view.'
          : 'Overpass error or network issue.'
      );
    }
  }
  
  return (
    <Container fluid className="pt-3">
      <h2 className="mb-3 d-flex justify-content-between">
        RoadNav (Mockup)
        <AuthButtons />
      </h2>

      <Row>
        <Col md={9}>
          <Toolbar onAddresses={handleAddresses} onRoad={handleRoad} />
          <MapView
            markers={markers}
            polylines={polylines}
            onMapReady={setMap}
            onSelectRoad={setSelectedRoad}
            selectedRoad={selectedRoad}
          />
        </Col>

        <Col md={3}>
          <div className="route-sidebar">
            <h5>Routes</h5>
            {/* Placeholder: fill this later with route options */}
            <p>No routes loaded yet.</p>
          </div>
        </Col>
      </Row>
    </Container>

  );
}
