<?php

// delete_swatch.php

// Set headers to specify JSON response
header('Content-Type: application/json');

// Include the database connection
require 'db_connect.php';

// Function to log messages without sending a response
function logMessage($pdo, $level, $message, $context = null) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO logs (level, message, context)
            VALUES (:level, :message, :context)
        ");
        $stmt->bindParam(':level', $level);
        $stmt->bindParam(':message', $message);
        
        if ($context !== null) {
            $contextJson = json_encode($context);
            $stmt->bindParam(':context', $contextJson);
        } else {
            $stmt->bindValue(':context', null, PDO::PARAM_NULL);
        }
        
        $stmt->execute();
    } catch (PDOException $e) {
        // If logging fails, there's not much we can do
    }
}

// Function to send JSON responses
function sendResponse($status, $message) {
    echo json_encode(['status' => $status, 'message' => $message]);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse('error', 'Invalid request method.');
}

// Retrieve and decode the raw POST data
$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);

// Log the incoming data for debugging
logMessage($pdo, 'INFO', 'Raw POST data received.', ['raw_data' => $rawData]);

// Validate the incoming data
if (!isset($data['swatch_id'])) {
    sendResponse('error', 'Swatch ID not provided.');
}

$swatchId = intval($data['swatch_id']);

// Additional validation: Ensure swatchId is positive
if ($swatchId <= 0) {
    sendResponse('error', 'Invalid Swatch ID.');
}

try {
    // Verify if the swatch exists before attempting deletion
    $checkStmt = $pdo->prepare("SELECT id FROM swatches WHERE id = :id");
    $checkStmt->bindParam(':id', $swatchId, PDO::PARAM_INT);
    $checkStmt->execute();
    $swatch = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$swatch) {
        sendResponse('error', 'Swatch not found.');
    }

    // Prepare the DELETE statement
    $stmt = $pdo->prepare("DELETE FROM swatches WHERE id = :id");
    $stmt->bindParam(':id', $swatchId, PDO::PARAM_INT);

    // Execute the deletion
    $stmt->execute();

    // Confirm deletion
    sendResponse('success', 'Swatch deleted successfully.');
} catch (PDOException $e) {
    // Log the error and send a JSON error response
    logMessage($pdo, 'ERROR', 'Database error occurred.', [
        'exception' => $e->getMessage(),
        'swatch_id' => $swatchId
    ]);
    sendResponse('error', 'Database error occurred.');
}
?>