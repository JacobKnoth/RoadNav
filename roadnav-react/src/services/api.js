import polyline from '@mapbox/polyline';
export async function geocode(addr) {
  const url =
    'https://nominatim.openstreetmap.org/search' +
    `?format=jsonv2&limit=1&email=jakek1406@gmail.com.com&q=${encodeURIComponent(addr)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('net');
  const data = await res.json();
  if (!data.length) throw new Error('notfound');
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

// src/services/api.js
export async function fetchRoadLines(name, bbox) {
  // escape regex metacharacters so api doesn't freak out over weird inputs
  const safe = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const query = `
    [out:json][timeout:25];
    (
      way["name"~"${safe}"](${bbox});
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

  // turn each way into an array of [lat, lon] pairs
  return osm.elements
    .filter(e => e.type === 'way' && e.geometry)
    .map(way => way.geometry.map(pt => [pt.lat, pt.lon]));
}

/**
* Ask Valhalla for a route and give back an array of [lat,lon] pairs
* ready for <Polyline positions={…}>.
*
* @param {[number,number]} from  [lat, lon]
* @param {[number,number]} to    [lat, lon]
*/
export async function fetchRoute(from, to, option) {
  let pruning = false;
  let top_speed = 50; // km/h
  if (option == 'auto') {
    pruning = true;
    top_speed = 180; // km/h
    console.warn('Using default auto routing option');
  }
  console.log(`fetchRoute: from=${from}, to=${to}, option=${option}, pruning=${pruning}, top_speed=${top_speed} km/h`);
  const body = {
    locations: [
      { lat: from[0], lon: from[1], type: 'break' },
      { lat: to[0], lon: to[1], type: 'break' }
    ],
    costing: option,                 // motorcycle has been mofidied to prefer curvy roads
        costing_options: {
      [option]: {
        "disable_hierarchy_pruning": pruning,
        "top_speed": top_speed // km/h
      }
    },
    directions_options: { units: 'km' }
  };
  
  const res = await fetch('/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
if (!res.ok) {
  // ←-- NEW: show status & first part of body for debugging
  const text = await res.text();
  console.error(`Valhalla error ${res.status}:`, text.slice(0, 300));
  throw new Error(`valhalla_${res.status}`);   // keep the status code
}
  const json = await res.json();
  return json.trip;
  // const encoded = json.trip.legs[0].shape;   // polyline6
  // return polyline.decode(encoded, 6).map(([lat, lon]) => [lat, lon]); // flip to Leaflet order
}
