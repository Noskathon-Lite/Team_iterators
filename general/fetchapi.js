const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Importing CORS

const app = express();
const PORT = 3000;

// API Keys (replace with your own)
const OPENWEATHERMAP_API_KEY = '4562d4de6709b52132c6b2dac0875cc2';
const OPENCAGE_API_KEY = 'f2ec302b0f3a498ebc968b5406f5143f';

// Enable CORS for all routes
app.use(cors());  // Add this line

app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send('Hello, world! This is the root route.');
});

// Function to fetch weather data
async function getWeatherData(city) {
    try {
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: OPENWEATHERMAP_API_KEY,
                units: 'metric',
            },
        });
        return weatherResponse.data;
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        throw new Error('Failed to fetch weather data.');
    }
}

// Function to fetch location data
async function getLocationData(city) {
    try {
        const locationResponse = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
            params: {
                q: city,
                key: OPENCAGE_API_KEY,
            },
        });

        const location = locationResponse.data.results[0];
        const lat = location.geometry.lat;
        const lon = location.geometry.lng;

        return { lat, lon };
    } catch (error) {
        console.error('Error fetching location data:', error.message);
        throw new Error('Failed to fetch location data.');
    }
}

// Function to fetch soil data (dummy data for now since there's no public NARC API)
async function getSoilData(lat, lon) {
    try {
        // Replace with actual API call if available
        return {
            parent_soil: 'Loamy',
            ph: 6.5,
            clay: '20%',
            organic_matter: '3%',
            total_nitrogen: '0.15%',
        };
    } catch (error) {
        console.error('Error fetching soil data:', error.message);
        throw new Error('Failed to fetch soil data.');
    }
}

// API route to get crop suggestions
app.get('/api/getCropSuggestions', async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({ error: 'City is required.' });
    }

    try {
        // Fetch location data
        const { lat, lon } = await getLocationData(city);

        // Fetch weather and soil data
        const weatherData = await getWeatherData(city);
        const soilData = await getSoilData(lat, lon);

        // Respond with combined data
        res.json({
            weather: weatherData,
            soil: soilData,
            location: { lat, lon },
        });
    } catch (error) {
        console.error('Error in /api/getCropSuggestions:', error.message);
        res.status(500).json({ error: 'Failed to fetch crop suggestions data.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
