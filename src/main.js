// Load API key from Vite env
const apiKey = import.meta.env.VITE_API_KEY;
console.log("Loaded API Key:", apiKey);

if (!apiKey) {
  alert("⚠ API key is missing! Please set VITE_API_KEY in your .env file");
}

const elements = {
  searchBtn: document.getElementById("search-btn"),
  cityInput: document.getElementById("city-input"),
  weatherCard: document.getElementById("weather"),
  forecastSection: document.getElementById("forecast"),
  forecastCards: document.getElementById("forecast-cards"),
  errorMsg: document.getElementById("error"),
  loader: document.getElementById("loader"),
  city: document.getElementById("city"),
  description: document.getElementById("description"),
  temp: document.getElementById("temp"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
};

// 🔎 Fix toggleVisibility so it only updates the states you pass
function toggleVisibility(states) {
  if (states.weather !== undefined) {
    elements.weatherCard.classList.toggle("hidden", !states.weather);
  }
  if (states.forecast !== undefined) {
    elements.forecastSection.classList.toggle("hidden", !states.forecast);
  }
  if (states.error !== undefined) {
    elements.errorMsg.classList.toggle("hidden", !states.error);
  }
  if (states.loading !== undefined) {
    elements.loader.classList.toggle("hidden", !states.loading);
  }
}

// Search button click
elements.searchBtn.addEventListener("click", () => {
  const city = elements.cityInput.value.trim();
  if (city) {
    fetchWeather(city);
    fetchForecast(city);
  }
});

// 🌤 Fetch current weather
async function fetchWeather(city) {
  try {
    toggleVisibility({ loading: true });

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    console.log("Fetching Weather:", url);

    const response = await fetch(url);
    const data = await response.json();
    console.log("Weather API Response:", data);

    if (!response.ok) {
      throw new Error(data.message || "City not found");
    }

    // Update DOM
    elements.city.textContent = `${data.name}, ${data.sys.country}`;
    elements.description.textContent = data.weather[0].description;
    elements.temp.textContent = `${Math.round(data.main.temp)}°C`;
    elements.humidity.textContent = data.main.humidity;
    elements.wind.textContent = data.wind.speed;

    toggleVisibility({ weather: true, error: false });
  } catch (error) {
    console.error("Weather error:", error);
    toggleVisibility({ error: true, weather: false });
  } finally {
    toggleVisibility({ loading: false });
  }
}

// 📅 Fetch 5-day forecast
async function fetchForecast(city) {
  try {
    elements.forecastCards.innerHTML = "";
    toggleVisibility({ loading: true });

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    console.log("Fetching Forecast:", url);

    const response = await fetch(url);
    const data = await response.json();
    console.log("Forecast API Response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Forecast not available");
    }

    const today = new Date().getDate();
    const grouped = {};

    data.list.forEach(item => {
      const date = new Date(item.dt_txt);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });
      if (date.getDate() !== today) {
        if (!grouped[day]) grouped[day] = { temps: [], weather: [] };
        grouped[day].temps.push(item.main.temp);
        grouped[day].weather.push(item.weather[0]);
      }
    });

    Object.keys(grouped).slice(0, 5).forEach(dayName => {
      const temps = grouped[dayName].temps;
      const avgWeather = grouped[dayName].weather[Math.floor(temps.length / 2)];
      const min = Math.round(Math.min(...temps));
      const max = Math.round(Math.max(...temps));

      const card = document.createElement("div");
      card.classList.add("forecast-card");
      card.innerHTML = `
        <h4>${dayName}</h4>
        <img src="https://openweathermap.org/img/wn/${avgWeather.icon}@2x.png" alt="">
        <p>${min}°C - ${max}°C</p>
        <small>${avgWeather.description}</small>
      `;
      elements.forecastCards.appendChild(card);
    });

    toggleVisibility({ forecast: true, error: false });
  } catch (error) {
    console.error("Forecast error:", error);
    toggleVisibility({ forecast: false });
  } finally {
    toggleVisibility({ loading: false });
  }
}
