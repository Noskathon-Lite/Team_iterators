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

def insert_data_into_db(moisture_value):
    """Insert the moisture data into the MySQL database."""
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Check the number of rows in the table
        cursor.execute("SELECT COUNT(*) FROM soil_data")
        total_entries = cursor.fetchone()[0]

        # If there are more than 10 entries, delete the oldest one
        if total_entries >= 10:
            cursor.execute("DELETE FROM soil_data ORDER BY timestamp ASC LIMIT 1")
        
        # Insert the new moisture data into the table
        cursor.execute("INSERT INTO soil_data (moisture) VALUES (%s)", (moisture_value,))
        
        conn.commit()  # Commit the transaction
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Error: {err}")

try:
    # Main loop to read data from Arduino and insert it into MySQL
    while True:
        if arduino.in_waiting > 0:
            moisture_data = arduino.readline().decode('utf-8').strip()  # Read the data from Arduino
            print(f"Received moisture data: {moisture_data}")
            insert_data_into_db(moisture_data)
        time.sleep(2)  # Wait before reading the next value

except KeyboardInterrupt:
    # Handle keyboard interrupt (Ctrl+C) gracefully
    print("\nProgram interrupted. Closing connections...")

finally:
    # Close the serial connection when done
    if arduino.is_open:
        arduino.close()
    print("Serial connection closed.")
