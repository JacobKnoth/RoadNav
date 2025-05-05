/* ---------- 1. BASIC MAP SETUP (unchanged) ---------- */
let center = [37.7749, -122.4194];   // fallback: SF
let zoom   = 13;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => { center = [pos.coords.latitude, pos.coords.longitude]; init(); },
    ()  => init()
  );
} else init();

let map, markerA, markerB, layerGroup;
function init() {
  map = L.map('map').setView(center, zoom);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  layerGroup = L.layerGroup().addTo(map); // will hold the two markers
}

/* ---------- 2. SIMPLE NOMINATIM GEOCODER ---------- */
async function geocode(addr) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en' },
    // Nominatim usage policy: identify your app
    referrerPolicy: 'no-referrer'
  });
  if (!res.ok) throw new Error('network');
  const data = await res.json();
  if (data.length === 0) throw new Error('not found');
  // use the first result
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

/* ---------- 3. FORM HANDLER ---------- */
document.getElementById('addrForm').addEventListener('submit', async e => {
  e.preventDefault();
  const status = document.getElementById('status');
  status.textContent = 'Searching…';

  try {
    const addr1 = document.getElementById('addrA').value.trim();
    const addr2 = document.getElementById('addrB').value.trim();
    const [locA, locB] = await Promise.all([geocode(addr1), geocode(addr2)]);

    // clear old markers
    layerGroup.clearLayers();

    markerA = L.marker(locA).addTo(layerGroup).bindPopup(addr1).openPopup();
    markerB = L.marker(locB).addTo(layerGroup).bindPopup(addr2);

    // fit map to both points with padding
    const bounds = L.latLngBounds([locA, locB]).pad(0.25);
    map.fitBounds(bounds);

    status.textContent = ''; // clear status
  } catch (err) {
    status.textContent =
      err.message === 'not found' ? 'Address not found.' : 'Error contacting geocoder.';
    console.error(err);
  }
});
