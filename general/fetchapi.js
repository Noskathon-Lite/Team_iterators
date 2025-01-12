const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser'); // To read CSV files

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Load dataset into memory
let dataset = [];
const datasetPath = path.join(__dirname, 'Crop_recommendation.csv');

fs.createReadStream(datasetPath)
  .pipe(csv())
  .on('data', (row) => {
    // Parse numeric values for computation
    dataset.push({
      N: parseFloat(row.N),
      P: parseFloat(row.P),
      K: parseFloat(row.K),
      temperature: parseFloat(row.temperature),
      humidity: parseFloat(row.humidity),
      ph: parseFloat(row.ph),
      rainfall: parseFloat(row.rainfall),
      label: row.label.trim(),
    });
  })
  .on('end', () => {
    console.log('Dataset loaded successfully.');
  });

// Helper function to calculate Euclidean distance
function calculateDistance(input, row) {
  return Math.sqrt(
    Math.pow(input.N - row.N, 2) +
      Math.pow(input.P - row.P, 2) +
      Math.pow(input.K - row.K, 2) +
      Math.pow(input.temperature - row.temperature, 2) +
      Math.pow(input.humidity - row.humidity, 2) +
      Math.pow(input.ph - row.ph, 2) +
      Math.pow(input.rainfall - row.rainfall, 2)
  );
}

// Route to get crop recommendation
app.post('/api/getCropRecommendation', (req, res) => {
  const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

  if (
    N === undefined ||
    P === undefined ||
    K === undefined ||
    temperature === undefined ||
    humidity === undefined ||
    ph === undefined ||
    rainfall === undefined
  ) {
    return res.status(400).json({ error: 'All input parameters are required.' });
  }

  // Find the closest match in the dataset
  let nearestRow = null;
  let minDistance = Infinity;

  dataset.forEach((row) => {
    const distance = calculateDistance({ N, P, K, temperature, humidity, ph, rainfall }, row);
    if (distance < minDistance) {
      minDistance = distance;
      nearestRow = row;
    }
  });

  if (!nearestRow) {
    return res.status(500).json({ error: 'Failed to find a suitable crop.' });
  }

  res.json({
    recommendedCrop: nearestRow.label,
    inputData: { N, P, K, temperature, humidity, ph, rainfall },
    nearestMatch: nearestRow,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
