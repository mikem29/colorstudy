<?php
// Set the content type to JSON
header('Content-Type: application/json');

// Include the database connection file
include 'db_connect.php';
include 'mix.php';

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the raw POST data
    $data = file_get_contents('php://input');
    $decodedData = json_decode($data, true);

    // Check if pigment_ids are provided
    if (isset($decodedData['pigment_ids']) && is_array($decodedData['pigment_ids'])) {
        $pigmentIds = $decodedData['pigment_ids'];

        // Limit to 5 pigments
        $pigmentIds = array_slice($pigmentIds, 0, 5);

        // Prepare placeholders for the SQL IN clause
        $placeholders = rtrim(str_repeat('?,', count($pigmentIds)), ',');

        // Fetch the pigment details from the database
        $sql = "SELECT pigment_id, name, color_hex FROM pigments WHERE pigment_id IN ($placeholders)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($pigmentIds);
        $pigments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Create a mapping of pigment_id to pigment data for easy access
        $pigmentMap = [];
        foreach ($pigments as $pigment) {
            $pigmentMap[$pigment['pigment_id']] = [
                'id' => $pigment['pigment_id'],
                'name' => $pigment['name'],
                'color_hex' => $pigment['color_hex']
            ];
        }

        // Arrange the pigments in the order received
        $orderedPigments = [];
        foreach ($pigmentIds as $id) {
            if (isset($pigmentMap[$id])) {
                $orderedPigments[] = $pigmentMap[$id];
            }
        }

        // Return the ordered pigments
        echo json_encode([
            'success' => true,
            'pigments' => $orderedPigments
        ]);
    } else {
        // Return an error response if pigment_ids are not provided
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
    }
} else {
    // Return an error response if the request method is not POST
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
