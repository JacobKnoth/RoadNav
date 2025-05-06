/* ---  A. BASIC MAP  ------------------------------------------------------ */

let map, highlightLayer;
let center = [37.7749, -122.4194]; // fallback centre

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        p => { center = [p.coords.latitude, p.coords.longitude]; init(); },
        _ => init());
} else init();

function init() {
    map = L.map('map').setView(center, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

/* ---  B. NOMINATIM ADDRESS -> [lat,lon] ---------------------------------- */

async function geocode(addr) {
    const url =
      'https://nominatim.openstreetmap.org/search' +
      '?format=jsonv2&limit=1' +
      '&email=my@example.com' +                    // ← put your email (Nominatim policy)
      '&q=' + encodeURIComponent(addr);
  
    const res = await fetch(url);                  // no extra headers
    if (!res.ok) {
      console.error('Nominatim status:', res.status);
      throw new Error('network');
    }
  
    const data = await res.json();
    if (!data.length) throw new Error('notfound');
  
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  

/* ---  C. OVERPASS ROAD-NAME HIGHLIGHT ------------------------------------ */

async function highlightByName(name) {
    const status = el('#status');
    status.textContent = 'Searching…';
  
    try {
      /* 1 — fetch ways + nodes in current bbox */
      const b = map.getBounds();
      const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
  
      const query = `
        [out:json][timeout:25];
        (
          way["name"~"${name}"](${bbox});
        );
        (._;>;);
        out body geom;
      `;
  
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'text/plain' }
      });
      if (!res.ok) throw new Error('overpass');
  
      const osm = await res.json();
      if (!osm.elements.length) throw new Error('none');
  
      /* 2 — build a mapping nodeID → [lat,lon] */
      const nodeLoc = {};
      osm.elements
        .filter(e => e.type === 'node')
        .forEach(n => { nodeLoc[n.id] = [n.lat, n.lon]; });
  
      /* 3 — convert each way into a GeoJSON LineString */
      const features = osm.elements
        .filter(e => e.type === 'way' && e.geometry)
        .map(way => ({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: way.geometry.map(pt => [pt.lon, pt.lat])
          },
          properties: { id: way.id, name }
        }));
  
      const geojson = { type: 'FeatureCollection', features };
  
      drawHighlight(geojson, { color: 'orange', weight: 5 });
      status.textContent = '';
    } catch (err) {
      status.textContent =
        err.message === 'none'      ? 'No ways found.' :
        err.message === 'overpass'  ? 'Overpass error.' :
                                      'Network error.';
      console.error(err);
    }
  }
  

/* ---  D. TWO-ADDRESS MARKERS -------------------------------------------- */

async function showTwoAddresses(a, b) {
    const status = el('#status');
    status.textContent = 'Geocoding…';

    try {
        const [locA, locB] = await Promise.all([geocode(a), geocode(b)]);

        const geojson = {
            type: 'FeatureCollection',
            features: [
                { type: 'Feature', geometry: { type: 'Point', coordinates: [locA[1], locA[0]] }, properties: { name: a } },
                { type: 'Feature', geometry: { type: 'Point', coordinates: [locB[1], locB[0]] }, properties: { name: b } }
            ]
        };

        const style = { radius: 6, fillColor: '#e31', color: '#e31', weight: 2, opacity: 1, fillOpacity: 0.8 };

        drawHighlight(geojson, null, style);               // custom point style
        map.fitBounds(L.latLngBounds([locA, locB]).pad(0.25));
        status.textContent = '';
    } catch (err) {
        status.textContent = err.message === 'notfound' ? 'Address not found.' : 'Network error.';
        console.error(err);
    }
}

/* ---  E. DRAW / CLEAR LAYER --------------------------------------------- */

function drawHighlight(geojson, lineStyle, pointStyle) {
    if (highlightLayer) map.removeLayer(highlightLayer);

    highlightLayer = L.geoJSON(geojson, {
        style: lineStyle || (() => ({ color: 'orange', weight: 5 })),
        pointToLayer: (f, latlng) =>
            pointStyle ? L.circleMarker(latlng, pointStyle).bindPopup(f.properties.name) :
                L.marker(latlng).bindPopup(f.properties.name || '')
    }).addTo(map);
}

/* ---  F. DOM HELPERS + EVENT BINDING ------------------------------------ */

const el = sel => document.querySelector(sel);

el('#btnAddr').addEventListener('click', () => {
    const a = el('#addrA').value.trim();
    const b = el('#addrB').value.trim();
    if (a && b) showTwoAddresses(a, b);
});

el('#btnRoad').addEventListener('click', () => {
    const road = el('#roadInput').value.trim();
    if (road) highlightByName(road);
});
