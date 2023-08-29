// give  variables names for API key, API URL, and DOM elements
let apiKey = '6498b3255d6e916bd41bd3d9f1d677ee';
let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q={CITY_NAME}&appid=${apiKey}&units=metric`;

let weatherContainer = document.getElementById('weather');
let weatherIconContainer = document.getElementById('weather-icon');
let searchButton = document.getElementById('search-btn');
let cityInput = document.getElementById('city-input');
let cityNameElement = document.getElementById('city-name');
let dateElement = document.getElementById('date');

// Add event listener to search button
searchButton.addEventListener('click', async () => {
  // Get trimmed city name from input field
  let city = cityInput.value.trim();
  if (city) {
    // Call getWeather function to fetch weather data
    await getWeather(city);
    cityInput.value = '';
  } else {
    clearWeatherData();
    weatherContainer.innerHTML = '<p class="message">Please enter a city name.</p>';
  }
});

// Add event listener to city input field for Enter key
cityInput.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    // Get trimmed city name from input field
    let city = cityInput.value.trim();
    if (city) {
      // Call getWeather function to fetch weather data
      await getWeather(city);
      cityInput.value = '';
    } else {
      clearWeatherData();
      weatherContainer.innerHTML = '<p class="message">Please enter a city name.</p>';
    }
  }
});

// Function to fetch weather data for a given city
async function getWeather(city) {
  let url = apiUrl.replace('{CITY_NAME}', city);

  try {
    clearWeatherData();

    // Send request to OpenWeatherMap API
    let response = await fetch(url);
    let data = await response.json();

    if (data.cod !== 200) {
      throw new Error(data.message || 'Failed to fetch weather data.');
    }

    // Extract weather information from API response
    let cityName = `${data.name}, ${data.sys.country}`;
    let currentDate = new Date().toLocaleDateString('nepali', { dateStyle: 'full' });
    let weatherCondition = data.weather[0].description;
    let iconCode = data.weather[0].icon;
    let temperature = data.main.temp;
    let pressure = data.main.pressure;
    let windSpeed = data.wind.speed;
    let humidity = data.main.humidity;
    fetch('./php/insert.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data) // Sending fetched data as JSON to PHP
    })
    .then(response => response.text())
    .then(responseText => {
      console.log(responseText); // Log the response from PHP
    })
    .catch(error => {
      console.error('Error sending data to PHP:', error);
    });
    document.querySelector(".historyButton").addEventListener("click", () => {
      window.location.href = `history.html?city=${city}`;
    });

    // Generate HTML for weather data display
    let weatherHtml = `
      <div class="boxes">
        <div class="box">
          <div class="icon"><img src="http://openweathermap.org/img/w/${iconCode}.png" alt="Weather Icon"></div>
          <div class="value">${temperature}°C</div>
          <div class="label">Temperature</div>
        </div>
      </div>
      <div class="boxes">
        <div class="box1">
          <div class="value">${weatherCondition}</div>
          <div class="label">Weather Condition</div>
        </div>
        <div class="box1">
          <div class="value">${pressure} hPa</div>
          <div class="label">Pressure</div>
        </div>
        <div class="box1">
          <div class="value">${windSpeed} m/s</div>
          <div class="label">Wind Speed</div>
        </div>
        <div class="box1">
          <div class="value">${humidity}%</div>
          <div class="label">Humidity</div>
        </div>
      </div>  
    `;

    // Update HTML elements with weather data
    weatherContainer.innerHTML = weatherHtml;
    cityNameElement.textContent = cityName;
    dateElement.textContent = currentDate;

  } catch (error) {
    console.log('Error:', error);
    clearWeatherData();
    weatherContainer.innerHTML = '<p class="message">' + error.message + '</p>';
  }
}

// Function to clear weather data from HTML elements
function clearWeatherData() {
  weatherContainer.innerHTML = '';
  weatherIconContainer.innerHTML = '';
  cityNameElement.textContent = '';
  dateElement.textContent = '';
}

// Call getWeather function initially with 'Guildford' as the default city
getWeather('Guildford');