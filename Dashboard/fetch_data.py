from flask import Flask, render_template
import mysql.connector

app = Flask(__name__)

# Database configuration
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "sensor_db"
}

def get_sensor_data():
    # Connect to the database
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # Query to fetch the latest sensor data
    cursor.execute("SELECT humidity, temperature FROM sensor_data ORDER BY timestamp DESC LIMIT 1")
    data = cursor.fetchone()

    # Close the connection
    cursor.close()
    conn.close()

    return data

@app.route('/')
def index():
    # Fetch sensor data
    data = get_sensor_data()
    
    # If no data, use defaults
    if data:
        humidity = data[0]
        temperature = data[1]
    else:
        humidity = 75  # default value
        temperature = 24  # default value

    # Render the HTML template with the sensor data
    return render_template('test.html', humidity=humidity, temperature=temperature)

if __name__ == '__main__':
    app.run(debug=True)

