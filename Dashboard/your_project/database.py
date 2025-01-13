import serial
import mysql.connector
import time

# Setup serial connection to Arduino (adjust the port accordingly)
arduino = serial.Serial('/dev/tty.usbmodem11301', 9600)  # Replace with your serial port

# MySQL Database Connection
db_config = {
    'host': 'localhost',
    'user': 'root',  # Your MySQL user
    'password': '',  # Your MySQL password (if any)
    'database': 'Farmers'  # Your database name
}

def insert_data_into_db(moisture, ph_value, humidity, temperature):
    """Insert sensor data into the MySQL database."""
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Query to insert data into the database
        query = "INSERT INTO sensor_data (moisture, ph_value, humidity, temperature) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (moisture, ph_value, humidity, temperature))

        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Error: {err}")

try:
    # Main loop to read data from Arduino and insert it into MySQL
    while True:
        if arduino.in_waiting > 0:
            # Read a line of data from Arduino
            line = arduino.readline().decode('utf-8').strip()
            try:
                # Parse the CSV data
                moisture, ph_value, humidity, temperature = map(float, line.split(","))
                print(f"Moisture: {moisture}, pH: {ph_value}, Humidity: {humidity}, Temperature: {temperature}")
                insert_data_into_db(int(moisture), ph_value, humidity, temperature)
            except ValueError:
                print(f"Invalid data received: {line}")
        time.sleep(2)

except KeyboardInterrupt:
    print("\nProgram interrupted. Closing connections...")

finally:
    if arduino.is_open:
        arduino.close()
    print("Serial connection closed.")
