const temperature = parseInt(document.getElementById('temperature').value);
    const humidity = parseInt(document.getElementById('humidity').value);
    const moisture = parseInt(document.getElementById('moisture').value);
// Function to show the pop-up notification
function showNotification(message, bgColor) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    notificationMessage.innerText = message;
    notification.classList.remove('hidden');
    notification.classList.add(bgColor);
}

// Function to check weather data and trigger notifications
function checkWeatherData() {
    // Check conditions based on weather data and trigger appropriate notifications
    if (temperature > 35) {
        showNotification("Warning: High temperature! Protect your crops.", "bg-red");
    } else if (humidity > 80) {
        showNotification("Alert: High humidity detected! Risk of mold.", "bg-orange");
    } else if (moisture < 20) {
        showNotification("Alert: Low moisture level! Consider irrigating your crops.", "bg-yellow");
    } else if (humidity > 90 && temperature < 30) {
        showNotification("Alert: Huge rainfall expected! Save your crops from water damage.", "bg-blue");
    } else {
        showNotification(`Everything looks fine! Temperature: ${temperature}°C, Humidity: ${humidity}%, Moisture: ${moisture}%`, "bg-green");
    }
}

// Function to close the notification
function closeNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('hidden');
}

// Event listener to close the notification on button click
document.getElementById('closeBtn').addEventListener('click', closeNotification);

// Check weather data periodically (every 1 second for testing purposes)
setInterval(checkWeatherData, 1000); // 1000ms = 1 second (You can change this to 60000ms for 1 minute)
