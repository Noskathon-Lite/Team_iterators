const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { exec } = require('child_process');  // Add this import
const path = require('path');

const app = express();
const PORT = 3000;

const OPENWEATHERMAP_API_KEY = '4562d4de6709b52132c6b2dac0875cc2';
const OPENCAGE_API_KEY = 'f2ec302b0f3a498ebc968b5406f5143f';

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // If you have a public directory for static files

// Function to get weather data
async function getWeatherData(city) {
    try {
        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                q: city,
                appid: OPENWEATHERMAP_API_KEY,
                units: 'metric', // For temperature in Celsius
            },
        });
        // Return temperature and humidity
        return {
            temperature: weatherResponse.data.main.temp,
            humidity: weatherResponse.data.main.humidity,
            rainfall: weatherResponse.data.main.rain
        };
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        throw new Error('Failed to fetch weather data.');
    }
}

// Function to get location data (latitude and longitude)
async function getLocationData(city) {
    try {
        const locationResponse = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
            params: {
                q: city,
                key: OPENCAGE_API_KEY,
            },
        });

        if (!locationResponse.data.results || locationResponse.data.results.length === 0) {
            throw new Error('Location not found');
        }

        const location = locationResponse.data.results[0];
        // Return latitude and longitude
        return {
            lat: location.geometry.lat,
            lon: location.geometry.lng,
        };
    } catch (error) {
        console.error('Error fetching location data:', error.message);
        throw new Error('Failed to fetch location data.');
    }
}

// Function to get soil data based on latitude and longitude
async function getSoilData(lat, lon) {
    try {
        const soilResponse = await axios.get('https://soil.narc.gov.np/soil/soildata', {
            params: { lat, lon },
        });
        // Return all relevant soil data
        return {
            parent_soil: soilResponse.data.parent_soil || 'Data not available',
            ph: soilResponse.data.ph || 'Data not available',
            clay: soilResponse.data.clay || 'Data not available',
            organic_matter: soilResponse.data.organic_matter || 'Data not available',
            total_nitrogen: soilResponse.data.total_nitrogen || 'Data not available',
            boron: soilResponse.data.boron || 'Data not available',
            p2o5: soilResponse.data.p2o5 || 'Data not available',
            sand: soilResponse.data.sand || 'Data not available',
            zinc: soilResponse.data.zinc || 'Data not available',
            potassium: soilResponse.data.potassium || 'Data not available',
        };
    } catch (error) {
        console.error('Error fetching soil data:', error.message);
        throw new Error('Failed to fetch soil data.');
    }
}

// Route to fetch crop suggestions based on city
app.get('/api/getCropSuggestions', async (req, res) => {
    const city = req.query.city;

    if (!city) {
        return res.status(400).json({ error: 'City is required.' });
    }

    try {
        const locationData = await getLocationData(city); // Fetch latitude and longitude
        const weatherData = await getWeatherData(city); // Fetch weather data
        const soilData = await getSoilData(locationData.lat, locationData.lon); // Fetch soil data

        const modelInput = {
            N: parseFloat(soilData.total_nitrogen),
            P: parseFloat(soilData.p2o5),
            K: parseFloat(soilData.potassium),
            temperature: parseFloat(weatherData.temperature) || 20,
            humidity: parseFloat(weatherData.humidity) || 50,
            ph: parseFloat(soilData.ph),
            rainfall: 0, // You can get rainfall data if available
        };

        // Ensure all values are numbers
        Object.keys(modelInput).forEach(key => {
            if (isNaN(modelInput[key])) {
                modelInput[key] = 0;
            }
        });

        // Use path.join for cross-platform compatibility
        const pythonScriptPath = path.join(__dirname, 'crop_prediction.py');

        exec(`python3 "${pythonScriptPath}" '${JSON.stringify(modelInput)}'`, (error, stdout, stderr) => {
          if (error) {
              console.error(`exec error: ${error}`);
              return res.status(500).json({ error: 'Failed to run the crop prediction model.' });
          }
      
          if (stderr) {
              console.log('Debug information from Python:', stderr);
          }
      
          // Parse the predictions from Python script
          let predictedCrop;
          try {
              // The stdout will be a JSON string of recommendations
              predictedCrop = stdout.trim();
              // Validate that it's valid JSON
              JSON.parse(predictedCrop);
          } catch (e) {
              console.error('Error parsing prediction output:', e);
              predictedCrop = JSON.stringify([{
                  crop: "Error in predictions",
                  confidence: 0,
                  matching_features: 0
              }]);
          }
          
          res.json({
              city: city,
              latitude: locationData.lat,
              longitude: locationData.lon,
              temperature: weatherData.temperature,
              humidity: weatherData.humidity,
              predictedCrop: predictedCrop,  // This will be the JSON string of recommendations
              parent_soil: soilData.parent_soil,
              ph: soilData.ph,
              clay: soilData.clay,
              organic_matter: soilData.organic_matter,
              total_nitrogen: soilData.total_nitrogen,
              boron: soilData.boron,
              p2o5: soilData.p2o5,
              sand: soilData.sand,
              zinc: soilData.zinc,
              potassium: soilData.potassium,
          });
      });

    } catch (error) {
        console.error('Error in /api/getCropSuggestions:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch crop suggestions data.',
            details: error.message
        });
    }
});

// Root route for the API
app.get('/', (req, res) => {
    res.send('Welcome to the Crop Prediction API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
