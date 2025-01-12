const express = require("express");
const socketIo = require("socket.io");
const { SerialPort } = require("serialport"); // Correct import
const { ReadlineParser } = require("@serialport/parser-readline"); // Import ReadlineParser from serialport

// Create an express app
const app = express();
const port = 3000;

// Serve static files (like HTML)
app.use(express.static("public"));

// Create an HTTP server and attach socket.io
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const io = socketIo(server);

// List the available serial ports
SerialPort.list()
  .then((ports) => {
    console.log("Available ports:", ports);
  })
  .catch((err) => {
    console.log("Error listing ports:", err);
  });

// Open the Arduino serial port
const serialPort = new SerialPort({
  path: "/dev/tty.usbmodemXXXX",
  baudRate: 9600,
}); // Replace with your Arduino's port

// Create a parser for the incoming data
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

// When the serial port gets data, send it to all connected clients
parser.on("data", (data) => {
  console.log("Data from Arduino:", data);
  io.emit("sensorData", data); // Emit data to the web page
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
