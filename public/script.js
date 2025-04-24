let map;
// get location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(publishLocation);
}
let lat = 100;
let lon = 100;


async function addRoadFromServer(wayId, style = { color: 'red', weight: 6 }) {
    const res = await fetch(`/way/${wayId}`);
    if (!res.ok) throw new Error('Server returned ' + res.status);
    const txt = await res.text();
    const rows = txt.trim().split('\n').slice(1);
    const coords = rows.map(r => r.split(',').map(Number));
    L.polyline(coords, style).addTo(map);
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
    const btn = document.getElementById('highlight');
    const inp = document.getElementById('wayinput');

    // Button handler
    btn.addEventListener('click', () => {
        const wayId = inp.value.trim();
        if (!wayId) { alert('Enter a way id'); return; }
        addRoadFromServer(wayId, { color: 'orange', weight: 6 })
            .catch(e => alert(e.message));
    });
});