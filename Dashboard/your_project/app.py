from flask import Flask, render_template
import mysql.connector

app = Flask(__name__)

# MySQL Database Connection
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'Farmers'
}

def fetch_latest_data():
    """Fetch the latest sensor data from the database."""
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Query to fetch the most recent data
        cursor.execute("""
            SELECT moisture, ph_value, humidity, temperature, timestamp
            FROM sensor_data
            ORDER BY timestamp DESC
            LIMIT 1
        """)
        latest_data = cursor.fetchone()

        cursor.close()
        conn.close()

        if latest_data:
            moisture, ph_value, humidity, temperature, timestamp = latest_data
            return moisture, ph_value, humidity, temperature, timestamp
        else:
            return None, None, None, None, None
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None, None, None, None, None

@app.route('/')
def index():
    """Render the HTML page with the latest data."""
    moisture, ph_value, humidity, temperature, timestamp = fetch_latest_data()

    if moisture is not None:
        return render_template(
            'index.html',
            moisture=moisture,
            ph_value=ph_value,
            humidity=humidity,
            temperature=temperature,
            timestamp=timestamp
        )
    else:
        return "No data found in the database."

if __name__ == '__main__':
    app.run(debug=True, port=5002)
