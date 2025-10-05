// script.js — corrected: fetches weather per-city lat/lon, gets humidity & precip, maps weather codes.
// Uses Open-Meteo (no API key). Units: Celsius + km/h

/* --- 30 cities with coordinates --- */
const cities = [
  { name: "Delhi, India", lat: 28.6139, lon: 77.2090 },
  { name: "Mumbai, India", lat: 19.0760, lon: 72.8777 },
  { name: "Chennai, India", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata, India", lat: 22.5726, lon: 88.3639 },
  { name: "Bengaluru, India", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad, India", lat: 17.3850, lon: 78.4867 },
  { name: "Pune, India", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad, India", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur, India", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow, India", lat: 26.8467, lon: 80.9462 },
  { name: "Indore, India", lat: 22.7196, lon: 75.8577 },
  { name: "Surat, India", lat: 21.1702, lon: 72.8311 },
  { name: "Chandigarh, India", lat: 30.7333, lon: 76.7794 },
  { name: "Bhopal, India", lat: 23.2599, lon: 77.4126 },
  { name: "Coimbatore, India", lat: 11.0168, lon: 76.9558 },
  { name: "Kochi, India", lat: 9.9312, lon: 76.2673 },
  { name: "Trivandrum, India", lat: 8.5241, lon: 76.9366 },
  { name: "Nagpur, India", lat: 21.1458, lon: 79.0882 },
  { name: "Goa, India", lat: 15.2993, lon: 74.1240 },
  { name: "Patna, India", lat: 25.5941, lon: 85.1376 },
  { name: "Ranchi, India", lat: 23.3441, lon: 85.3096 },
  { name: "Guwahati, India", lat: 26.1445, lon: 91.7362 },
  { name: "Varanasi, India", lat: 25.3176, lon: 82.9739 },
  { name: "Madurai, India", lat: 9.9252, lon: 78.1198 },
  { name: "Mysuru, India", lat: 12.2958, lon: 76.6394 },
  { name: "Visakhapatnam, India", lat: 17.6868, lon: 83.2185 },
  { name: "Dehradun, India", lat: 30.3165, lon: 78.0322 },
  { name: "Shimla, India", lat: 31.1048, lon: 77.1734 },
  { name: "Srinagar, India", lat: 34.0837, lon: 74.7973 },
  { name: "Agra, India", lat: 27.1767, lon: 78.0081 }
];

/* --- DOM refs --- */
const citySelect = document.getElementById("citySelect");
const cityForm = document.getElementById("cityForm");
const weatherSection = document.getElementById("weatherInfo");

/* --- Fill dropdown --- */
cities.forEach((c, idx) => {
  const opt = document.createElement("option");
  opt.value = idx; // store index
  opt.textContent = c.name;
  citySelect.appendChild(opt);
});

/* --- Initialize Leaflet map (dark tiles) --- */
const map = L.map("map", { zoomControl: false, attributionControl: false }).setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);

/* --- Create markers for all cities --- */
const markers = [];
cities.forEach((c, i) => {
  const marker = L.circleMarker([c.lat, c.lon], {
    radius: 6,
    fillColor: "#00c6ff",
    color: "#00a6d6",
    weight: 1,
    opacity: 0.9,
    fillOpacity: 0.85
  }).addTo(map);
  marker.bindTooltip(c.name, { direction: "top" });
  marker.cityIndex = i;
  marker.on("click", () => {
    // set select and fetch
    citySelect.value = i;
    cityForm.requestSubmit(); // triggers submit
  });
  markers.push(marker);
});

/* --- Pulse management --- */
let pulseInterval = null;
let pulsingMarker = null;
function startPulse(marker) {
  stopPulse();
  pulsingMarker = marker;
  let r = 6;
  let grow = true;
  pulseInterval = setInterval(() => {
    r += grow ? 0.6 : -0.6;
    if (r >= 14) grow = false;
    if (r <= 6) grow = true;
    marker.setStyle({ radius: r });
  }, 80);
}
function stopPulse() {
  if (pulseInterval) {
    clearInterval(pulseInterval);
    pulseInterval = null;
  }
  if (pulsingMarker) {
    pulsingMarker.setStyle({ radius: 6 });
    pulsingMarker = null;
  }
}

/* --- Helper: map weather code to human text --- */
function weatherCodeToText(code) {
  // Based on Open-Meteo weather codes (common mapping)
  if (code === 0) return "Clear";
  if (code === 1 || code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
}

/* --- Comfort logic --- */
function comfortLevel(tempC, windKmh, precipMm) {
  if (tempC > 35) return ["Very Hot 🔥", "hot"];
  if (tempC < 10) return ["Very Cold ❄️", "cold"];
  if (windKmh > 50) return ["Very Windy 💨", "wind"];
  if (precipMm > 10) return ["Very Wet 🌧️", "wet"];
  if (tempC > 30 && precipMm > 5) return ["Uncomfortable 😓", "hot"];
  return ["Comfortable 🙂", "comfort"];
}

/* --- Fetch weather for selected city using Open-Meteo --- */
async function fetchWeatherForCity(idx) {
  try {
    const c = cities[idx];
    // Request: current weather + hourly humidity & precipitation, timezone auto, units: Celsius & km/h
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}` +
                `&current_weather=true&hourly=relativehumidity_2m,precipitation&timezone=auto` +
                `&temperature_unit=celsius&windspeed_unit=kmh`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather API error");
    const data = await res.json();

    const cur = data.current_weather; // temperature, windspeed (km/h), weathercode, time
    // find index in hourly array for current time to get humidity & precip
    let humidity = "--", precip = 0;
    if (data.hourly && data.hourly.time && data.hourly.relativehumidity_2m) {
      const idxTime = data.hourly.time.indexOf(cur.time);
      if (idxTime !== -1) {
        humidity = data.hourly.relativehumidity_2m[idxTime];
        precip = data.hourly.precipitation ? data.hourly.precipitation[idxTime] : 0;
      } else {
        // fallback: take nearest last value
        humidity = data.hourly.relativehumidity_2m[0] ?? "--";
        precip = (data.hourly.precipitation && data.hourly.precipitation[0]) ? data.hourly.precipitation[0] : 0;
      }
    }

    // Update UI with accurate values
    updateUIWithWeather(c.name, cur, humidity, precip);
    // Move map to city and start pulse on marker
    map.flyTo([c.lat, c.lon], 8, { duration: 1.3 });
    stopPulse();
    const marker = markers[idx];
    marker.setStyle({ fillColor: "#00ff9d", color: "#00ff9d" });
    startPulse(marker);
    marker.openPopup?.();
  } catch (err) {
    console.error(err);
    alert("Could not fetch weather. Try again.");
  }
}

/* --- Update DOM --- */
function updateUIWithWeather(cityName, current, humidity, precip) {
  // current: { temperature, windspeed, weathercode, time }
  document.getElementById("cityName").textContent = cityName;
  document.getElementById("date").textContent = (new Date(current.time)).toLocaleString();
  document.getElementById("tempMin").textContent = `${(current.temperature - 2).toFixed(1)}°C`;
  document.getElementById("tempAvg").textContent = `${current.temperature.toFixed(1)}°C`;
  document.getElementById("tempMax").textContent = `${(current.temperature + 2).toFixed(1)}°C`;
  document.getElementById("humidity").textContent = (typeof humidity === "number") ? humidity : "--";
  document.getElementById("wind").textContent = `${current.windspeed.toFixed(1)}`; // km/h (we requested kmh)
  document.getElementById("precip").textContent = (precip !== undefined && !isNaN(precip)) ? `${precip.toFixed(1)}` : "0.0";
  document.getElementById("sky").textContent = weatherCodeToText(current.weathercode);

  const summaryText = `Right now: ${weatherCodeToText(current.weathercode)} • ${current.temperature.toFixed(1)}°C • wind ${current.windspeed.toFixed(1)} km/h`;
  document.getElementById("summary").textContent = summaryText;

  // comfort
  const [comfortText, comfortClass] = comfortLevel(current.temperature, current.windspeed, precip);
  document.getElementById("comfort").textContent = comfortText;
  const bar = document.getElementById("comfortBar");
  bar.className = "fill " + comfortClass;

  weatherSection.classList.remove("hidden");
}

/* --- On form submit --- */
cityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const idx = parseInt(citySelect.value, 10);
  if (isNaN(idx)) return;
  // reset marker colors
  markers.forEach(m => m.setStyle({ fillColor: "#00c6ff", color: "#00a6d6" }));
  fetchWeatherForCity(idx);
});

/* --- Resize handling for Leaflet (important on mobile / orientation change) --- */
window.addEventListener("resize", () => {
  setTimeout(() => map.invalidateSize(), 300);
});
setTimeout(() => map.invalidateSize(), 500); // initial fix for some browsers
