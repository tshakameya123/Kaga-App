import React, { useState } from 'react';
import axios from 'axios';
import './Weather.css';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!city) return; // Don't proceed if city is empty

    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:4000/api/weather', { params: { city } });
      setWeatherData(response.data);
    } catch (error) {
      setError('Unable to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Choose an icon based on the weather description
  const getWeatherIcon = (description) => {
    if (description.toLowerCase().includes('cloud')) return '☁️';
    if (description.toLowerCase().includes('sun') || description.toLowerCase().includes('clear')) return '☀️';
    if (description.toLowerCase().includes('rain')) return '🌧️';
    return '❓';
  };

  const description = weatherData?.current?.weather_descriptions[0];
  const icon = description ? getWeatherIcon(description) : null;

  return (
    <div className="weather-container">
      <h3>Check Weather</h3>
      <input 
        type="text" 
        placeholder="Enter city name" 
        value={city} 
        onChange={(e) => setCity(e.target.value)} 
      />
      <button onClick={fetchWeather}>Get Weather</button>
      {loading && <p>Loading weather...</p>}
      {error && <p>{error}</p>}
      {weatherData && (
        <div className="weather-info">
          <div className="weather-icon">{icon}</div>
          <p>{weatherData.location.name}, {weatherData.location.country}</p>
          <p className="temperature">{weatherData.current.temperature}°C</p>
          <p className="condition">{description}</p>
          <div className="additional-info">
            <p>💧 Humidity: {weatherData.current.humidity}%</p>
            <p>🌬️ Wind Speed: {weatherData.current.wind_speed} km/h</p>
            <p>☔ Precipitation: {weatherData.current.precip} mm</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
