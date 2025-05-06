export async function geocode(addr) {
  const url =
    'https://nominatim.openstreetmap.org/search' +
    `?format=jsonv2&limit=1&email=my@example.com&q=${encodeURIComponent(addr)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('net');
  const data = await res.json();
  if (!data.length) throw new Error('notfound');
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}
  
// src/services/api.js
export async function fetchRoadLines(name, bbox) {
  // escape regex metacharacters so Overpass doesn’t choke on e.g. “Bob's I‑5”
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

  