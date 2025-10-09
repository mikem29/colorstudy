<?php
// save_swatches.php

// Include the database connection
require 'db_connect.php'; // Ensure this path is correct

// Set the response header to JSON
header('Content-Type: application/json');
// test
// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Retrieve the raw POST data
  $data = json_decode(file_get_contents('php://input'), true);

  // Get the image_id from the data
  $imageId = isset($data['image_id']) ? intval($data['image_id']) : null;
  $swatches = isset($data['swatches']) ? $data['swatches'] : null;

  // Validate image_id and swatches
  if (!$imageId || !is_array($swatches) || empty($swatches)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input data.']);
    exit;
  }

  // Begin a transaction for better performance and integrity
  $pdo->beginTransaction();

  try {
    // Prepare the SQL statement using prepared statements to prevent SQL injection
    $stmt = $pdo->prepare("INSERT INTO swatches (hex_color, red, green, blue, cmyk, description, image_id) VALUES (:hex_color, :red, :green, :blue, :cmyk, :description, :image_id)");

    foreach ($swatches as $swatch) {
      // Validate each swatch
      if (
        isset($swatch['hex_color'], $swatch['red'], $swatch['green'], $swatch['blue'], $swatch['cmyk'], $swatch['description']) &&
        !empty($swatch['description'])
      ) {
        // Bind parameters
        $stmt->bindParam(':hex_color', $swatch['hex_color']);
        $stmt->bindParam(':red', $swatch['red'], PDO::PARAM_INT);
        $stmt->bindParam(':green', $swatch['green'], PDO::PARAM_INT);
        $stmt->bindParam(':blue', $swatch['blue'], PDO::PARAM_INT);
        $stmt->bindParam(':cmyk', $swatch['cmyk']);
        $stmt->bindParam(':description', $swatch['description']);
        $stmt->bindParam(':image_id', $imageId, PDO::PARAM_INT);

        // Execute the statement
        $stmt->execute();
      } else {
        // If any swatch data is invalid, rollback and log the issue
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Invalid swatch data.']);
        exit;
      }
    }

    // Commit the transaction
    $pdo->commit();

    // Respond with success
    echo json_encode(['status' => 'success', 'message' => 'Swatches saved successfully.']);
  } catch (PDOException $e) {
    // Rollback the transaction on error and log the issue
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Database error occurred: ' . $e->getMessage()]);
    exit;
  }
} else {
  // Respond with method not allowed
  echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
