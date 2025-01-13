
// Sidebar Navigation
function initializeSidebar() {
    document.querySelectorAll(".sidebar-icon").forEach((icon) => {
        icon.addEventListener("click", function () {
            document.querySelector(".sidebar-icon.active").classList.remove("active");
            this.classList.add("active");
        });
    });
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.querySelector(".search-container input");
    searchInput.addEventListener("input", function (e) {
        console.log("Searching for:", e.target.value);
        // Implement search logic here
    });
}

// Card Hover Effects
function initializeCardHoverEffects() {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Gauge Functionality
function updateGauge(selector, value) {
    const fill = document.querySelector(`${selector} .gauge-circle-fill`);
    const display = document.querySelector(`${selector} .gauge-value`);
    const rotation = (value / 100) * 180;
    fill.style.transform = `rotate(${rotation}deg)`;
    display.textContent = `${value}%`;
}

// Temperature Display
function updateTemperature(value, unit = 'Celsius') {
    const display = document.querySelector('.temperature-value');
    const unitDisplay = document.querySelector('.temperature-unit');
    display.textContent = `${value}°`;
    unitDisplay.textContent = unit;
}

// Historical Data
function updateHistoricalData(cardSelector, data) {
    const historicalSection = document.querySelector(`${cardSelector} .historical-data`);
    if (historicalSection && data) {
        historicalSection.innerHTML = Object.entries(data)
            .map(([time, value]) => `<p>${time}: ${value}%</p>`)
            .join('');
    }
}

// Notification System
function initializeNotifications() {
    const notificationBell = document.querySelector('.avatar svg[viewBox="0 0 24 24"]');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            console.log('Opening notifications panel');
            // Implement notification panel logic here
        });
    }
}

// Data Refresh
function refreshDashboardData() {
    // Simulate data updates
    updateGauge('.metric-card:nth-child(1)', 90); // Moisture
    updateGauge('.metric-card:nth-child(2)', 75); // Humidity
    updateTemperature(24);
    
    const historicalData = {
        'Last hour': '88',
        '6 hours ago': '85',
        '24 hours ago': '92'
    };
    updateHistoricalData('.metric-card:nth-child(1)', historicalData);
}

// Real-time Updates
function startRealTimeUpdates() {
    // Simulate real-time data updates every 30 seconds
    setInterval(() => {
        const randomMoisture = 85 + Math.random() * 10;
        const randomHumidity = 70 + Math.random() * 10;
        const randomTemp = 22 + Math.random() * 4;
        
        updateGauge('.metric-card:nth-child(1)', Math.round(randomMoisture));
        updateGauge('.metric-card:nth-child(2)', Math.round(randomHumidity));
        updateTemperature(Math.round(randomTemp * 10) / 10);
    }, 30000);
}

// Error Handling
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    // Implement error notification system here
}

// Initialize Dashboard
function initializeDashboard() {
    try {
        initializeSidebar();
        initializeSearch();
        initializeCardHoverEffects();
        initializeNotifications();
        refreshDashboardData();
        startRealTimeUpdates();
    } catch (error) {
        handleError(error, 'dashboard initialization');
    }
}

// Start the dashboard when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Export functions for potential module usage
export {
    initializeDashboard,
    updateGauge,
    updateTemperature,
    updateHistoricalData,
    refreshDashboardData
};




//Update


// Database Connection Configuration
const dbConfig = {
    host: 'your_host',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
};

// Fetch Data from Database
async function fetchMetricsData() {
    try {
        // Example fetch call to your backend API
        const response = await fetch('/api/metrics');
        const data = await response.json();
        return data;
    } catch (error) {
        handleError(error, 'data fetching');
        return null;
    }
}

// Pie Chart Functionality
function updatePieChart(selector, value) {
    const fill = document.querySelector(`${selector} .gauge-circle-fill`);
    const display = document.querySelector(`${selector} .gauge-value`);
    
    // Calculate rotation based on percentage (360 degrees = 100%)
    const rotation = (value / 100) * 360;
    
    // For values less than 50%
    if (value <= 50) {
        fill.style.transform = `rotate(${rotation}deg)`;
        fill.style.backgroundColor = getColorForValue(value);
        fill.style.clip = 'rect(0, 100px, 200px, 0)';
    } 
    // For values more than 50%
    else {
        // First half of the circle
        fill.style.transform = 'rotate(180deg)';
        fill.style.backgroundColor = getColorForValue(value);
        fill.style.clip = 'rect(0, 100px, 200px, 0)';

        // Create or update second half for values > 50%
        let secondHalf = document.querySelector(`${selector} .gauge-circle-fill-2`);
        if (!secondHalf) {
            secondHalf = fill.cloneNode(true);
            secondHalf.classList.add('gauge-circle-fill-2');
            fill.parentNode.appendChild(secondHalf);
        }
        
        // Rotate second half based on remaining percentage
        const remainingRotation = ((value - 50) / 100) * 360;
        secondHalf.style.transform = `rotate(${remainingRotation}deg)`;
        secondHalf.style.backgroundColor = getColorForValue(value);
        secondHalf.style.clip = 'rect(0, 100px, 200px, 0)';
    }
    
    // Update the display value
    display.textContent = `${Math.round(value)}%`;
}

// Get color based on value
function getColorForValue(value) {
    // Color gradient from red to yellow to green
    if (value < 30) {
        return '#ff4757'; // Red for low values
    } else if (value < 70) {
        return '#ffa502'; // Yellow for medium values
    } else {
        return '#2ed573'; // Green for high values
    }
}

// Real-time Updates with Database Integration
async function startRealTimeUpdates() {
    try {
        // Initial data load
        const data = await fetchMetricsData();
        if (data) {
            updatePieChart('.metric-card:nth-child(1)', data.moisture);
            updatePieChart('.metric-card:nth-child(2)', data.humidity);
            updateTemperature(data.temperature);
            updateHistoricalData('.metric-card:nth-child(1)', data.moistureHistory);
        }

        // Set up real-time updates
        setInterval(async () => {
            const newData = await fetchMetricsData();
            if (newData) {
                updatePieChart('.metric-card:nth-child(1)', newData.moisture);
                updatePieChart('.metric-card:nth-child(2)', newData.humidity);
                updateTemperature(newData.temperature);
                updateHistoricalData('.metric-card:nth-child(1)', newData.moistureHistory);
            }
        }, 30000); // Update every 30 seconds
    } catch (error) {
        handleError(error, 'real-time updates');
    }
}

// Add these styles to your CSS
const pieChartStyles = `
.gauge {
    position: relative;
    width: 200px;
    height: 200px;
    margin: 0 auto;
    border-radius: 50%;
    background-color: #f1f2f6;
    overflow: hidden;
}

.gauge-circle {
    width: 100%;
    height: 100%;
    position: absolute;
    clip: rect(0, 100px, 200px, 0);
    border-radius: 50%;
    transition: all 1s ease-in-out;
}

.gauge-circle-fill, .gauge-circle-fill-2 {
    transform-origin: 100% 50%;
    transition: all 1s ease-in-out;
}

.gauge-value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
    font-weight: bold;
    color: #2d3436;
    z-index: 2;
}
`;

// Initialize Dashboard
async function initializeDashboard() {
    try {
        // Add pie chart styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = pieChartStyles;
        document.head.appendChild(styleSheet);

        initializeSidebar();
        initializeSearch();
        initializeCardHoverEffects();
        initializeNotifications();
        await startRealTimeUpdates();
    } catch (error) {
        handleError(error, 'dashboard initialization');
    }
}

// Example backend API endpoint (Node.js/Express)
/*
app.get('/api/metrics', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM metrics ORDER BY timestamp DESC LIMIT 1');
        const [history] = await connection.execute('SELECT * FROM metrics ORDER BY timestamp DESC LIMIT 24');
        
        const moistureHistory = history.reduce((acc, row) => {
            acc[formatTimestamp(row.timestamp)] = row.moisture;
            return acc;
        }, {});

        res.json({
            moisture: rows[0].moisture,
            humidity: rows[0].humidity,
            temperature: rows[0].temperature,
            moistureHistory
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
*/

// Start the dashboard when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Export functions for potential module usage
export {
    initializeDashboard,
    updatePieChart,
    updateTemperature,
    updateHistoricalData,
    fetchMetricsData
};