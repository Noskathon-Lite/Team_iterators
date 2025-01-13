from flask import Flask, render_template
import mysql.connector

app = Flask(__name__)

# MySQL Database Connection (using root user without a password)
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'Farmers'
}
def fetch_latest_data():
    """Fetch the latest moisture data from the database."""
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Query to fetch the most recent moisture data
        cursor.execute("SELECT moisture, timestamp FROM soil_data ORDER BY timestamp DESC LIMIT 1")
        latest_data = cursor.fetchone()

        cursor.close()
        conn.close()

        if latest_data:
            moisture_level, timestamp = latest_data
            return moisture_level, timestamp
        else:
            return None, None
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None, None

@app.route('/')
def index():
    """Render the HTML page with the latest data."""
    moisture_level, timestamp = fetch_latest_data()

    if moisture_level is not None and timestamp is not None:
        return render_template('index.html', moisture=moisture_level, timestamp=timestamp)
    else:
        return "No data found in the database."

if __name__ == '__main__':
    app.run(debug=True, port=5002)
