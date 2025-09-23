<?php
// save_swatches.php
/* @todo
 * 1. Ability to reset a swatch and repick an eye dropper use font awesome free.
 * 2. Make the loupe show a zoomed in area that is picked instead
    of the color. And the color can fill the swatch area its going to inhabit.
 * /
 *

// Include the database connection
require 'db_connect.php'; // Ensure this path is correct

// Set the response header to JSON
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Retrieve the raw POST data
  $data = json_decode(file_get_contents('php://input'), true);

  // Check if data is an array
  if (is_array($data)) {
    $response = ['status' => 'success', 'message' => 'Swatches saved successfully.'];

    // Begin a transaction for better performance and integrity
    $pdo->beginTransaction();

    try {
      // Prepare the SQL statement using prepared statements to prevent SQL injection
      $stmt = $pdo->prepare("INSERT INTO swatches (hex_color, red, green, blue, cmyk, description) VALUES (:hex_color, :red, :green, :blue, :cmyk, :description)");

      foreach ($data as $swatch) {
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

          // Execute the statement
          $stmt->execute();
        } else {
          // If any swatch data is invalid, rollback and log the issue
          $pdo->rollBack();
          echo json_encode(['status' => 'error', 'message' => 'Invalid input data in one or more swatches.']);
          exit;
        }
      }

      // Commit the transaction
      $pdo->commit();
    } catch (PDOException $e) {
      // Rollback the transaction on error and log the issue
      $pdo->rollBack();
      echo json_encode(['status' => 'error', 'message' => 'Database error occurred.']);
      exit;
    }

    // Respond with success
    echo json_encode($response);
  } else {
    // Respond with validation error
    echo json_encode(['status' => 'error', 'message' => 'Invalid input data.']);
  }
} else {
  // Respond with method not allowed
  echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
