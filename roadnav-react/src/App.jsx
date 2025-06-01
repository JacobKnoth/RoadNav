import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Toolbar from './components/Toolbar';
import MapView from './components/MapView';
import AuthButtons from './components/AuthButtons';
import { geocode, fetchRoadLines, fetchRoute } from './services/api';
import './App.css';
import polyline from '@mapbox/polyline';
import { saveRouteForUser } from './services/saveroute';
import RoutesSidebar from './components/RoutesSidebar';


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

  const [routingOption, setRoutingOption] = useState('motorcycle');
  async function handleAddresses(a, b) {
    try {
      const [m1, m2] = await Promise.all([geocode(a), geocode(b)]);
      setMarkers([m1, m2]);
      const trip = await fetchRoute(m1, m2, routingOption);
      console.log('Routing option ➜', routingOption);
      console.log('Trip object from Valhalla ➜', trip);

      // const encoded = trip.legs[0].shape;   // polyline6
      const encoded = trip?.legs?.[0]?.shape;
      if (!encoded) throw new Error('shape_missing');
      const route = polyline.decode(encoded, 6).map(([lat, lon]) => [lat, lon]); // flip to Leaflet order
      setLines([route]);
      let visualRoutingOption = routingOption;
      if (visualRoutingOption === 'motorcycle') {
        visualRoutingOption = 'Curvy Nav';
      }
      if (visualRoutingOption === 'bicycle') {
        visualRoutingOption = 'Bicycle';
      }
      if (visualRoutingOption === 'auto') {
        visualRoutingOption = 'Default';
      }
      saveRouteForUser({
        from: m1,
        to: m2,
        profile: visualRoutingOption,
        encoded: encoded,
        trip
      }).catch(console.error);
    } catch (err) {
      console.error('handleAddresses error ➜', err);       // 🚨 real reason
      const msg =
        err.message === 'notfound'
          ? 'Address not found.'
          : err.message === 'shape_missing'
            ? 'Valhalla did not return a shape.'
            : err.message.startsWith('polyline')
              ? 'Could not decode route geometry.'
              : 'Unexpected error – check console.';
      alert(msg);
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

  const handleSelectSaved = (points, meta) => {
    setLines([points]);
    setMarkers([meta.from, meta.to]);
    // optional: pan/fit map if MapView exposes a method  
  };

  return (
    <Container fluid className="pt-3">
      <h2 className="mb-3 d-flex justify-content-between align-items-center">
        <span className="roadnav-title d-flex align-items-center gap-2">
          <span role="img" aria-label="map">🗺️</span>
          <span>Road<span style={{ color: '#4285f4' }}>Nav</span></span>
        </span>
        <AuthButtons />
      </h2>
      <p className="text-muted">
        Find curvy roads, plan routes, and save them for later.
      </p>
      <Row>
        <Col md={9}>
          <Toolbar
            onAddresses={handleAddresses}
            onRoad={handleRoad}
            setRoutingOption={setRoutingOption}
          />
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
          <RoutesSidebar
            onSelect={handleSelectSaved}
            bbox={bbox}
            routingOption={routingOption} />
        </Col>
      </Row>
    </Container>

  );
}
