const weatherData = {
  "Kochi, Kerala": [
    { temp: 30, wind: 10, rain: 12, humidity: 75, sky: "Cloudy" },
    { temp: 32, wind: 8, rain: 5, humidity: 70, sky: "Sunny" },
    { temp: 28, wind: 12, rain: 15, humidity: 80, sky: "Rainy" }
  ],
  "Bangalore, India": [
    { temp: 28, wind: 10, rain: 5, humidity: 65, sky: "Clear" },
    { temp: 24, wind: 15, rain: 12, humidity: 70, sky: "Cloudy" },
    { temp: 25, wind: 8, rain: 0, humidity: 60, sky: "Sunny" }
  ],
  "Delhi, India": [
    { temp: 31, wind: 12, rain: 0, humidity: 40, sky: "Sunny" },
    { temp: 32, wind: 14, rain: 3, humidity: 45, sky: "Clear" },
    { temp: 29, wind: 10, rain: 8, humidity: 50, sky: "Cloudy" }
  ],
  "Mumbai, India": [
    { temp: 31, wind: 15, rain: 20, humidity: 80, sky: "Rainy" },
    { temp: 27, wind: 12, rain: 10, humidity: 70, sky: "Cloudy" },
    { temp: 30, wind: 8, rain: 5, humidity: 75, sky: "Sunny" }
  ],
  "Dubai, UAE": [
    { temp: 32, wind: 8, rain: 0, humidity: 20, sky: "Sunny" },
    { temp: 33, wind: 6, rain: 0, humidity: 15, sky: "Clear" },
    { temp: 34, wind: 10, rain: 0, humidity: 25, sky: "Sunny" }
  ],
  "London, UK": [
    { temp: 11, wind: 18, rain: 10, humidity: 60, sky: "Cloudy" },
    { temp: 12, wind: 20, rain: 15, humidity: 65, sky: "Rainy" },
    { temp: 18, wind: 12, rain: 5, humidity: 55, sky: "Clear" }
  ],
  "New York, USA": [
    { temp: 22, wind: 12, rain: 5, humidity: 50, sky: "Sunny" },
    { temp: 18, wind: 10, rain: 0, humidity: 55, sky: "Clear" },
    { temp: 25, wind: 14, rain: 8, humidity: 60, sky: "Cloudy" }
  ],
  "Tokyo, Japan": [
    { temp: 26, wind: 10, rain: 15, humidity: 65, sky: "Rainy" },
    { temp: 29, wind: 12, rain: 20, humidity: 70, sky: "Cloudy" },
    { temp: 23, wind: 8, rain: 2, humidity: 60, sky: "Sunny" }
  ],
  "Sydney, Australia": [
    { temp: 28, wind: 25, rain: 2, humidity: 55, sky: "Clear" },
    { temp: 22, wind: 18, rain: 5, humidity: 60, sky: "Cloudy" },
    { temp: 16, wind: 12, rain: 8, humidity: 65, sky: "Rainy" }
  ],
  "Toronto, Canada": [
    { temp: 20, wind: 11, rain: 3, humidity: 50, sky: "Cloudy" },
    { temp: 6, wind: 14, rain: 5, humidity: 55, sky: "Snowy" },
    { temp: 12, wind: 10, rain: 0, humidity: 45, sky: "Sunny" }
  ]
};

function comfortLevel(temp, wind, rain) {
  if (temp > 35) return ["Very Hot 🔥", "hot"];
  else if (temp < 10) return ["Very Cold ❄️", "cold"];
  else if (wind > 20) return ["Very Windy 💨", "wind"];
  else if (rain > 15) return ["Very Wet 🌧️", "wet"];
  else if (temp > 30 && rain > 5) return ["Very Uncomfortable 😓", "hot"];
  else return ["Comfortable 🙂", "comfort"];
}

// Populate city dropdown
const citySelect = document.getElementById("citySelect");
Object.keys(weatherData).forEach(city => {
  const opt = document.createElement("option");
  opt.value = city;
  opt.textContent = city;
  citySelect.appendChild(opt);
});

// Handle form submit
document.getElementById("cityForm").addEventListener("submit", e => {
  e.preventDefault();

  const city = citySelect.value;
  const data = weatherData[city][Math.floor(Math.random() * weatherData[city].length)];

  const [comfort, comfortClass] = comfortLevel(data.temp, data.wind, data.rain);
  const summary = `Today in ${city}, expect ${data.sky.toLowerCase()} skies with temperature around ${data.temp}°C.`;
  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  document.getElementById("weatherCard").style.display = "block";
  document.getElementById("cityName").textContent = city;
  document.getElementById("date").textContent = date;
  document.getElementById("tempMin").textContent = `${data.temp - 3}°C`;
  document.getElementById("tempAvg").textContent = `${data.temp}°C`;
  document.getElementById("tempMax").textContent = `${data.temp + 4}°C`;
  document.getElementById("humidity").textContent = data.humidity;
  document.getElementById("wind").textContent = data.wind;
  document.getElementById("rain").textContent = data.rain;
  document.getElementById("sky").textContent = data.sky;
  document.getElementById("summary").textContent = summary;
  document.getElementById("comfort").textContent = comfort;

  const bar = document.getElementById("comfortBar");
  bar.className = "fill " + comfortClass;
});
