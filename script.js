// 🌤️ Weather Comfort Checker JS
// Futurinx — 2025

const citySelect = document.getElementById("citySelect");
const cityForm = document.getElementById("cityForm");
const weatherInfo = document.getElementById("weatherInfo");

// 🌍 30 Popular Indian Cities (Add your own)
const cities = [
  { name: "Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Indore", lat: 22.7196, lon: 75.8577 },
  { name: "Surat", lat: 21.1702, lon: 72.8311 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { name: "Trivandrum", lat: 8.5241, lon: 76.9366 },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { name: "Goa", lat: 15.2993, lon: 74.1240 },
  { name: "Patna", lat: 25.5941, lon: 85.1376 },
  { name: "Ranchi", lat: 23.3441, lon: 85.3096 },
  { name: "Guwahati", lat: 26.1445, lon: 91.7362 },
  { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { name: "Madurai", lat: 9.9252, lon: 78.1198 },
  { name: "Mysuru", lat: 12.2958, lon: 76.6394 },
  { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { name: "Dehradun", lat: 30.3165, lon: 78.0322 },
  { name: "Shimla", lat: 31.1048, lon: 77.1734 },
  { name: "Srinagar", lat: 34.0837, lon: 74.7973 },
  { name: "Agra", lat: 27.1767, lon: 78.0081 },
];

// 🌎 Initialize Leaflet Map
const map = L.map("map", {
  zoomControl: false,
  attributionControl: false,
}).setView([20.5937, 78.9629], 5);

// Dark tile style
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 19,
}).addTo(map);

// Add all cities to select dropdown
cities.forEach(city => {
  const opt = document.createElement("option");
  opt.value = `${city.lat},${city.lon}`;
  opt.textContent = city.name;
  citySelect.appendChild(opt);
});

// Store markers for glow effect
let markers = [];
cities.forEach(c => {
  const m = L.circleMarker([c.lat, c.lon], {
    radius: 6,
    fillColor: "#00c6ff",
    color: "#00ffff",
    weight: 1,
    opacity: 0.9,
    fillOpacity: 0.8
  }).addTo(map);
  m.bindTooltip(c.name, { permanent: false });
  markers.push(m);
});

// 🌀 Animate marker pulse
function pulseMarker(marker) {
  let scale = 1;
  let growing = true;
  setInterval(() => {
    scale = growing ? scale + 0.05 : scale - 0.05;
    if (scale >= 1.5) growing = false;
    if (scale <= 1) growing = true;
    marker.setStyle({ radius: 6 * scale });
  }, 100);
}

// Weather API (Open-Meteo, free no key)
async function fetchWeather(lat, lon, cityName) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const res = await fetch(url);
  const data = await res.json();
  const w = data.current_weather;
  updateWeatherUI(cityName, w);
}

// Update UI
function updateWeatherUI(city, w) {
  const date = new Date().toLocaleString();
  weatherInfo.innerHTML = `
    <h2>${city}</h2>
    <p class="date">${date}</p>
    <div class="temp-box">
      <div>🌡️ Min: ${(w.temperature - 2).toFixed(1)}°C</div>
      <div class="avg">Avg: ${w.temperature.toFixed(1)}°C</div>
      <div>🔥 Max: ${(w.temperature + 2).toFixed(1)}°C</div>
    </div>
    <div class="details">
      <div>💨 Wind: ${w.windspeed} km/h</div>
      <div>🌦️ Code: ${w.weathercode}</div>
      <div>🕒 Time: ${w.time.split("T")[1]}</div>
    </div>
    <p class="summary">Feels ${w.temperature > 30 ? 'hot' : w.temperature < 20 ? 'cool' : 'pleasant'} today 🌡️</p>
    <div class="comfort">
      <span>Comfort Level</span>
      <div class="bar"><div class="fill ${w.temperature > 30 ? 'hot' : w.temperature < 20 ? 'cold' : 'comfort'}"></div></div>
    </div>
  `;
}

// Handle city form submit
cityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const [lat, lon] = citySelect.value.split(",");
  const city = citySelect.options[citySelect.selectedIndex].text;
  map.flyTo([lat, lon], 8, { duration: 1.5 });

  // Add pulse effect to selected city
  markers.forEach(m => m.setStyle({ fillColor: "#00c6ff" }));
  const selectedMarker = markers.find((m, i) => cities[i].name === city);
  selectedMarker.setStyle({ fillColor: "#00ff9d" });
  pulseMarker(selectedMarker);

  fetchWeather(lat, lon, city);
});
