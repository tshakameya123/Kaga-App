// server/routes/weather.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// WeatherStack API key (replace with your actual API key)
const WEATHER_API_KEY = '713727e1ac30eab9949a0acca2e774e6';

router.get('/weather', async (req, res) => {
  const { city } = req.query; // Extract city from query parameter

  if (!city) {
    return res.status(400).json({ message: 'City is required' });
  }

  try {
    const response = await axios.get(`http://api.weatherstack.com/current`, {
      params: {
        access_key: WEATHER_API_KEY,
        query: city,
      },
    });

    const weatherData = response.data;

    // Handle error if the city is not found
    if (weatherData.error) {
      return res.status(400).json({ message: weatherData.error.info });
    }

    // Return weather data if successful
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

export default router;
