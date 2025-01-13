<?php
 $hostname = "localhost"; 
 $username = "root"; 
 $password = ""; 
 $database = "sensor_db"; 
 
 $conn = mysqli_connect($hostname, $username, $password, $database);
 
 if (!$conn) { 
     die("Connection failed: " . mysqli_connect_error()); 
 } 

    // $t = 20;
    // $h = 30;
 
    //  $sql = "INSERT INTO dht11 (temperature, moisture) VALUES (".$t.", ".$h.")"; 
 
    //  if (mysqli_query($conn, $sql)) { 
    //      echo "\nNew record created successfully"; 
    //  } else { 
    //      echo "Error: " . $sql . "<br>" . mysqli_error($conn); 
    //  }
 
 if(isset($_POST["temperature"]) && isset($_POST["humidity"])) {
 
     $t = $_POST["temperature"];
     $h = $_POST["humidity"];
 
     $sql = "INSERT INTO dht11 (temperature, humidity) VALUES (".$t.", ".$h.")"; 
 
     if (mysqli_query($conn, $sql)) { 
         echo "\nNew record created successfully"; 
     } else { 
         echo "Error: " . $sql . "<br>" . mysqli_error($conn); 
     }
 }
?>