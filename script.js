const apiKey = "c27449d94f5e6f6ab28a5a38a32fe1de"; // OpenWeatherMap API key

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherInfo = document.getElementById("weather-info");
const forecastDiv = document.getElementById("forecast");
const searchList = document.getElementById("search-list");
const toggleTheme = document.getElementById("toggle-theme");

let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

// Theme toggle
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  toggleTheme.textContent = document.body.classList.contains("dark-mode")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

// Display recent searches
function updateRecentSearches() {
  searchList.innerHTML = "";
  recentSearches.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => getWeather(city));
    searchList.appendChild(li);
  });
}
updateRecentSearches();

// Main function
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});

// Optional: press Enter to search
cityInput.addEventListener("keyup", e => {
  if (e.key === "Enter") searchBtn.click();
});

function getWeather(city) {
  const encodedCity = encodeURIComponent(city); // Fix for spaces and accents
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then(data => {
      displayWeather(data);
      saveSearch(city);
      getForecast(city);
    })
    .catch(err => alert(err.message));
}

function displayWeather(data) {
  weatherInfo.classList.remove("hidden");
  weatherInfo.innerHTML = `
    <h2>${data.name}</h2>
    <p>${data.weather[0].description}</p>
    <p>🌡 Temp: ${data.main.temp} °C</p>
    <p>Feels Like: ${data.main.feels_like} °C</p>
    <p>💨 Wind: ${data.wind.speed} m/s</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}"></p>
  `;
}

function getForecast(city) {
  const encodedCity = encodeURIComponent(city);
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error("Forecast not available");
      return res.json();
    })
    .then(data => {
      forecastDiv.classList.remove("hidden");
      forecastDiv.innerHTML = "";

      // Group forecast by day
      const dailyData = [];
      const seenDates = new Set();

      data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0]; // get YYYY-MM-DD
        if (!seenDates.has(date)) {
          seenDates.add(date);
          dailyData.push(item);
        }
      });

      dailyData.slice(0, 5).forEach(day => {
        const card = document.createElement("div");
        card.className = "forecast-card";
        card.innerHTML = `
          <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
          <p>${day.weather[0].main}</p>
          <p>Temp: ${day.main.temp} °C</p>
          <p><img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}"></p>
        `;
        forecastDiv.appendChild(card);
      });
    })
    .catch(err => {
      forecastDiv.classList.add("hidden");
      console.error(err);
    });
}

// Save to recent searches (normalized)
function saveSearch(city) {
  const normalizedCity = city.toLowerCase();
  if (!recentSearches.some(c => c.toLowerCase() === normalizedCity)) {
    recentSearches.unshift(city);
    if (recentSearches.length > 5) recentSearches.pop();
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    updateRecentSearches();
  }
}