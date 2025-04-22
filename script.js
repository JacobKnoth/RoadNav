// get location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(publishLocation);
}
let lat = 100;
let lon = 100;
// pushes the location to the map
function publishLocation(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    console.log("Latitude: " + lat + ", Longitude: " + lon);
    createMap();
}
// creates the map
function createMap() {
    var map = L.map('map').setView([lat, lon], 13);
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
