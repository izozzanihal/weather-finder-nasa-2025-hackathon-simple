/* script.js - updated: 30 locations added (single sample reading per city) */

const weatherData = {
  "Kochi, Kerala":     [{ temp: 30, wind: 10, rain: 12, humidity: 75, sky: "Cloudy", coords: [9.9312, 76.2673] }],
  "Bangalore, India":  [{ temp: 28, wind: 10, rain: 5,  humidity: 65, sky: "Clear", coords: [12.9716, 77.5946] }],
  "Delhi, India":      [{ temp: 31, wind: 12, rain: 0,  humidity: 40, sky: "Sunny", coords: [28.6139, 77.2090] }],
  "Mumbai, India":     [{ temp: 31, wind: 15, rain: 20, humidity: 80, sky: "Rainy", coords: [19.0760, 72.8777] }],
  "Chennai, India":    [{ temp: 33, wind: 9,  rain: 2,  humidity: 70, sky: "Sunny", coords: [13.0827, 80.2707] }],
  "Hyderabad, India":  [{ temp: 29, wind: 8,  rain: 0,  humidity: 45, sky: "Clear", coords: [17.3850, 78.4867] }],
  "Pune, India":       [{ temp: 27, wind: 6,  rain: 0,  humidity: 50, sky: "Clear", coords: [18.5204, 73.8567] }],
  "Ahmedabad, India":  [{ temp: 35, wind: 7,  rain: 0,  humidity: 30, sky: "Hot", coords: [23.0225, 72.5714] }],
  "Kolkata, India":    [{ temp: 29, wind: 12, rain: 5,  humidity: 70, sky: "Cloudy", coords: [22.5726, 88.3639] }],
  "Thiruvananthapuram":[{ temp: 29, wind: 9,  rain: 10, humidity: 78, sky: "Cloudy", coords: [8.5241, 76.9366] }],
  "Kozhikode":         [{ temp: 28, wind: 11, rain: 8,  humidity: 76, sky: "Cloudy", coords: [11.2588, 75.7804] }],
  "Kannur":            [{ temp: 27, wind: 10, rain: 6,  humidity: 75, sky: "Cloudy", coords: [11.8745, 75.3704] }],
  "Madurai":           [{ temp: 31, wind: 7,  rain: 1,  humidity: 60, sky: "Sunny", coords: [9.9252, 78.1198] }],
  "Coimbatore":        [{ temp: 29, wind: 8,  rain: 3,  humidity: 62, sky: "Clear", coords: [11.0168, 76.9558] }],
  "Kollam":            [{ temp: 28, wind: 9,  rain: 9,  humidity: 77, sky: "Rainy", coords: [8.8932, 76.6141] }],

  /* Global cities */
  "Dubai, UAE":        [{ temp: 33, wind: 6,  rain: 0,  humidity: 15, sky: "Clear", coords: [25.276987, 55.296249] }],
  "London, UK":        [{ temp: 11, wind: 18, rain: 10, humidity: 60, sky: "Cloudy", coords: [51.5072, -0.1276] }],
  "New York, USA":     [{ temp: 22, wind: 12, rain: 5,  humidity: 50, sky: "Sunny", coords: [40.7128, -74.0060] }],
  "Tokyo, Japan":      [{ temp: 26, wind: 10, rain: 15, humidity: 65, sky: "Rainy", coords: [35.6762, 139.6503] }],
  "Sydney, Australia": [{ temp: 22, wind: 18, rain: 5,  humidity: 60, sky: "Cloudy", coords: [-33.8688, 151.2093] }],
  "Toronto, Canada":   [{ temp: 20, wind: 11, rain: 3,  humidity: 50, sky: "Cloudy", coords: [43.6532, -79.3832] }],
  "Singapore":         [{ temp: 30, wind: 8,  rain: 10, humidity: 80, sky: "Humid", coords: [1.3521, 103.8198] }],
  "Paris, France":     [{ temp: 18, wind: 9,  rain: 2,  humidity: 65, sky: "Clear", coords: [48.8566, 2.3522] }],
  "Berlin, Germany":   [{ temp: 16, wind: 12, rain: 4,  humidity: 60, sky: "Cloudy", coords: [52.5200, 13.4050] }],
  "Los Angeles, USA":  [{ temp: 24, wind: 5,  rain: 0,  humidity: 55, sky: "Sunny", coords: [34.0522, -118.2437] }],
  "San Francisco, USA":[{ temp: 18, wind: 14, rain: 0,  humidity: 70, sky: "Foggy", coords: [37.7749, -122.4194] }],
  "Riyadh, Saudi":     [{ temp: 40, wind: 10, rain: 0,  humidity: 10, sky: "Hot", coords: [24.7136, 46.6753] }],
  "Johannesburg, ZA":  [{ temp: 19, wind: 8,  rain: 0,  humidity: 40, sky: "Clear", coords: [-26.2041, 28.0473] }],
  "Nairobi, Kenya":    [{ temp: 21, wind: 7,  rain: 2,  humidity: 55, sky: "Clear", coords: [-1.2921, 36.8219] }],
  "Colombo, Sri Lanka":[{ temp: 29, wind: 10, rain: 12, humidity: 78, sky: "Rainy", coords: [6.9271, 79.8612] }]
};

/* Comfort logic */
function comfortLevel(temp, wind, rain) {
  if (temp > 35) return ["Very Hot 🔥", "hot"];
  else if (temp < 10) return ["Very Cold ❄️", "cold"];
  else if (wind > 20) return ["Very Windy 💨", "wind"];
  else if (rain > 15) return ["Very Wet 🌧️", "wet"];
  else if (temp > 30 && rain > 5) return ["Very Uncomfortable 😓", "hot"];
  else return ["Comfortable 🙂", "comfort"];
}

/* Populate city dropdown */
const citySelect = document.getElementById("citySelect");
Object.keys(weatherData).forEach(city => {
  const opt = document.createElement("option");
  opt.value = city;
  opt.textContent = city;
  citySelect.appendChild(opt);
});

/* Leaflet map init */
const map = L.map("map").setView([20, 80], 4);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);
let marker = null;

/* Form submit handler */
document.getElementById("cityForm").addEventListener("submit", e => {
  e.preventDefault();

  const city = citySelect.value;
  if (!city || !weatherData[city]) return;

  /* For flexibility we still pick a random reading if array has >1 items */
  const arr = weatherData[city];
  const data = arr[Math.floor(Math.random() * arr.length)];

  const [comfort, comfortClass] = comfortLevel(data.temp, data.wind, data.rain);
  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });

  const card = document.getElementById("weatherCard");
  card.classList.remove("hidden");
  document.getElementById("cityName").textContent = city;
  document.getElementById("date").textContent = date;
  document.getElementById("tempMin").textContent = `${data.temp - 3}°C`;
  document.getElementById("tempAvg").textContent = `${data.temp}°C`;
  document.getElementById("tempMax").textContent = `${data.temp + 3}°C`;
  document.getElementById("humidity").textContent = data.humidity;
  document.getElementById("wind").textContent = data.wind;
  document.getElementById("rain").textContent = data.rain;
  document.getElementById("sky").textContent = data.sky;
  document.getElementById("summary").textContent = `Today in ${city}, expect ${data.sky.toLowerCase()} skies with temperature around ${data.temp}°C.`;
  document.getElementById("comfort").textContent = comfort;

  const bar = document.getElementById("comfortBar");
  bar.className = "fill " + comfortClass;

  /* Update map position & marker */
  const [lat, lon] = data.coords;
  map.flyTo([lat, lon], 6, { duration: 1.2 });
  if (marker) marker.remove();
  marker = L.marker([lat, lon]).addTo(map).bindPopup(`<b>${city}</b><br>${comfort}`).openPopup();
});
