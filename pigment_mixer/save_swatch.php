<?php
require 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $imageId = isset($data['image_id']) ? intval($data['image_id']) : null;
    $swatch = isset($data['swatch']) ? $data['swatch'] : null;

    if (!$imageId || !$swatch) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid input data.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO swatches (hex_color, red, green, blue, cmyk, description, image_id) VALUES (:hex_color, :red, :green, :blue, :cmyk, :description, :image_id)");

        $stmt->bindParam(':hex_color', $swatch['hex_color']);
        $stmt->bindParam(':red', $swatch['red'], PDO::PARAM_INT);
        $stmt->bindParam(':green', $swatch['green'], PDO::PARAM_INT);
        $stmt->bindParam(':blue', $swatch['blue'], PDO::PARAM_INT);
        $stmt->bindParam(':cmyk', $swatch['cmyk']);
        $stmt->bindParam(':description', $swatch['description']);
        $stmt->bindParam(':image_id', $imageId, PDO::PARAM_INT);

        $stmt->execute();

        $swatchId = $pdo->lastInsertId();

        echo json_encode(['status' => 'success', 'message' => 'Swatch saved successfully.', 'swatch_id' => $swatchId]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error occurred: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
