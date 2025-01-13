const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { exec } = require('child_process');  // To execute Python script

const app = express();
const PORT = 3000;

// API Keys (replace with your own)
const OPENWEATHERMAP_API_KEY = '4562d4de6709b52132c6b2dac0875cc2';
const OPENCAGE_API_KEY = 'f2ec302b0f3a498ebc968b5406f5143f';

// Enable CORS for all routes
app.use(cors());
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

// Function to fetch location data (latitude and longitude)
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

// Function to fetch soil data from NARC Soil API using latitude and longitude
async function getSoilData(lat, lon) {
    try {
        // Replace this with the actual NARC Soil API URL
        const soilResponse = await axios.get('https://soil.narc.gov.np/soil/api/soildata', {
            params: {
                lat: lat,
                lon: lon,
            },
        });

        return soilResponse.data;
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

        // Log the soil data for debugging
        console.log('Soil Data:', soilData);

        // Check if necessary data exists before using it
        const K = soilData && soilData.nutrients ? soilData.nutrients.K : null;
        const pH = soilData ? soilData.ph : null;

        if (K === null || pH === null) {
            return res.status(500).json({ error: 'Soil data is incomplete. Please check the API response.' });
        }

        // Prepare input data for the Python model
        const modelInput = {
            N: weatherData.main.temp,  // Example: Use temperature as 'N' (you can adjust based on your dataset)
            P: pH,                     // Example: Use pH as 'P'
            K: K,                      // Potassium levels (adjust as needed)
            temperature: weatherData.main.temp,
            humidity: weatherData.main.humidity,
            ph: pH,
            rainfall: weatherData.rain ? weatherData.rain["1h"] : 0  // Check for rainfall
        };

        // Call the Python script to get the prediction
        exec(`python3 crop_prediction.py '${JSON.stringify(modelInput)}'`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).json({ error: 'Failed to run the crop prediction model.' });
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return res.status(500).json({ error: 'Error in Python script.' });
            }

            // Return the predicted crop
            const predictedCrop = stdout.trim();
            res.json({ predictedCrop: predictedCrop, location: { lat, lon }, weather: weatherData, soil: soilData });
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
