import pymysql
import serial
import time

# Database configuration
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "sensor_db"
}

# Arduino Serial port configuration
serial_port = "COM10"  # Replace with your Arduino's COM port
baud_rate = 9600       # Match the baud rate used in your Arduino code

# Connect to the database
try:
    connection = pymysql.connect(**db_config)
    cursor = connection.cursor()
    print("Database connection successful!")
except Exception as e:
    print(f"Database connection failed: {e}")
    exit()

# Read data from Serial and upload to SQL
try:
    arduino = serial.Serial(serial_port, baud_rate)
    print("Reading data from Arduino...")

    while True:
        # Read a line of data from Arduino
        data = arduino.readline().decode("utf-8").strip()

        # Check for "Humidity" and "Temperature" in the data
        if "Humidity:" in data and "Temperature:" in data:
            try:
                # Parse humidity and temperature from the string
                parts = data.split("\t")  # Split by tab character
                humidity = float(parts[0].split(":")[1].strip().replace("%", ""))
                temperature = float(parts[1].split(":")[1].strip().replace("°C", ""))

                # Get the current timestamp
                timestamp = time.strftime('%Y-%m-%d %H:%M:%S')

                # Insert data into the database
                insert_query = """
                INSERT INTO dht11 (Temperature, Humidity, DateTime)
                VALUES (%s, %s, %s)
                """
                cursor.execute(insert_query, (temperature, humidity, timestamp))
                connection.commit()

                # Keep only the latest 15 rows
                delete_query = """
                DELETE FROM dht11
                WHERE Id NOT IN (
                    SELECT Id FROM (
                        SELECT Id FROM dht11
                        ORDER BY Id DESC LIMIT 15
                    ) AS temp_table
                )
                """
                cursor.execute(delete_query)
                connection.commit()

                print(f"Data inserted: Humidity={humidity}%, Temperature={temperature}°C, Time={timestamp}")
            except Exception as e:
                print(f"Error processing data: {e}")
        else:
            print(f"Invalid data format. Skipping: {data}")

except KeyboardInterrupt:
    print("\nStopping data upload...")
finally:
    # Close connections
    if cursor:
        cursor.close()
    if connection:
        connection.close()
    if arduino:
        arduino.close()
    print("All connections closed.")
