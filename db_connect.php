<?php
// db_connect.php

// Database configuration
$host = 'localhost';
$db   = 'colorstudy'; // Your database name
$user = 'm29user';    // Your database username
$pass = 'm29Pa55word';// Your database password
$port = '3306';       // MySQL default port
$charset = 'utf8mb4';

// Data Source Name (DSN)
$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

// PDO options for better error handling and security
$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Enable exceptions
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Fetch associative arrays
  PDO::ATTR_EMULATE_PREPARES   => false,                  // Disable emulation of prepared statements
];

try {
  // Create a new PDO instance
  $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
  // Handle connection errors gracefully
  echo "Database connection failed: " . htmlspecialchars($e->getMessage());
  exit;
}
?>
