let map;
// get location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(publishLocation);
}
let lat = 100;
let lon = 100;


// quick CSV→polyline helper
async function addRoadFromCSV(url, lineOptions = {color:'red',weight:6}) {
    const txt  = await fetch(url).then(r => r.text());
    const rows = txt.trim().split('\n').slice(1);          // skip header
    const coords = rows.map(r => r.split(',').map(Number)) // [[lat,lon], …]
                       .map(([lat, lon]) => [lat, lon]);   // Leaflet expects this order
    L.polyline(coords, lineOptions).addTo(map);
  }

// pushes the location to the map
function publishLocation(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    console.log("Latitude: " + lat + ", Longitude: " + lon);
    createMap();
}

// creates the map
function createMap() {
    map = L.map('map').setView([lat, lon], 13);
    L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
    )
        .addTo(map);
    L.marker([lat, lon])
        .addTo(map)
        .bindPopup('You are here!')
        .openPopup();
}
document.addEventListener('DOMContentLoaded', () => {
    const btn  = document.getElementById('highlight');
    const inp  = document.getElementById('wayinput');
  
    btn.addEventListener('click', () => {
      const wayId = inp.value.trim();
      if (!wayId) { alert('Enter a way id'); return; }
  
      // build the filename your C++ exporter writes, e.g. way_123456.csv
      const file = `way_${wayId}.csv`;
      addRoadFromCSV(file, { color: 'orange', weight: 6 })
        .catch(() => alert(`Could not load ${file}`));
    });
  });