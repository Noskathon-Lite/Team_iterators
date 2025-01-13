
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
// function updateTemperature(value, unit = 'Celsius') {
//     const display = document.querySelector('.temperature-value');
//     const unitDisplay = document.querySelector('.temperature-unit');
//     display.textContent = `${value}°`;
//     unitDisplay.textContent = unit;
// }

// Historical Data
// function updateHistoricalData(cardSelector, data) {
//     const historicalSection = document.querySelector(`${cardSelector} .historical-data`);
//     if (historicalSection && data) {
//         historicalSection.innerHTML = Object.entries(data)
//             .map(([time, value]) => `<p>${time}: ${value}%</p>`)
//             .join('');
//     }
// }

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
// function refreshDashboardData() {
//     // Simulate data updates
//     updateGauge('.metric-card:nth-child(1)', 90); // Moisture
//     updateGauge('.metric-card:nth-child(2)', 75); // Humidity
//     updateTemperature(24);
    
//     const historicalData = {
//         'Last hour': '88',
//         '6 hours ago': '85',
//         '24 hours ago': '92'
//     };
//     updateHistoricalData('.metric-card:nth-child(1)', historicalData);
// }

// Real-time Updates
// function startRealTimeUpdates() {
//     // Simulate real-time data updates every 30 seconds
//     setInterval(() => {
//         const randomMoisture = 85 + Math.random() * 10;
//         const randomHumidity = 70 + Math.random() * 10;
//         const randomTemp = 22 + Math.random() * 4;
        
//         updateGauge('.metric-card:nth-child(1)', Math.round(randomMoisture));
//         updateGauge('.metric-card:nth-child(2)', Math.round(randomHumidity));
//         updateTemperature(Math.round(randomTemp * 10) / 10);
//     }, 30000);
// }

// Error Handling
// function handleError(error, context) {
//     console.error(`Error in ${context}:`, error);
//     // Implement error notification system here
// }

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
// export {
//     initializeDashboard,
//     updateGauge,
//     updateTemperature,
//     updateHistoricalData,
//     refreshDashboardData
// };
