console.log("API Key:", import.meta.env.VITE_API_KEY);

const apiKey = import.meta.env.VITE_API_KEY;

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

elements.searchBtn.addEventListener("click", () => {
  const city = elements.cityInput.value.trim();
  if (city) {
    fetchWeather(city);
    fetchForecast(city);
  }
});

async function fetchWeather(city) {
  try {
    toggleVisibility({ loading: true });

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();

    elements.city.textContent = `${data.name}, ${data.sys.country}`;
    elements.description.textContent = data.weather[0].description;
    elements.temp.textContent = `${Math.round(data.main.temp)}°C`;
    elements.humidity.textContent = data.main.humidity;
    elements.wind.textContent = data.wind.speed;

    toggleVisibility({ weather: true });
  } catch (error) {
    toggleVisibility({ error: true });
  } finally {
    toggleVisibility({ loading: false });
  }
}

async function fetchForecast(city) {
  try {
    elements.forecastCards.innerHTML = "";
    toggleVisibility({ loading: true });

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not available");

    const data = await response.json();
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
        <img src="http://openweathermap.org/img/wn/${avgWeather.icon}@2x.png" alt="">
        <p>${min}°C - ${max}°C</p>
        <small>${avgWeather.description}</small>
      `;
      elements.forecastCards.appendChild(card);
    });

    toggleVisibility({ forecast: true });
  } catch (error) {
    console.error("Forecast error:", error);
  } finally {
    toggleVisibility({ loading: false });
  }
}

function toggleVisibility({ weather = false, forecast = false, error = false, loading = false }) {
  elements.weatherCard.classList.toggle("hidden", !weather);
  elements.forecastSection.classList.toggle("hidden", !forecast);
  elements.errorMsg.classList.toggle("hidden", !error);
  elements.loader.classList.toggle("hidden", !loading);
}
