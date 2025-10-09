<?php
include 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

$type = $data['type'];
$finalRgb = $data['finalRgb'];
$pigments = $data['pigments'];

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("INSERT INTO pigment_mixes (type, final_rgb) VALUES (:type, :final_rgb)");
    $stmt->execute([
        ':type' => $type,
        ':final_rgb' => $finalRgb
    ]);

    $mixId = $pdo->lastInsertId();

    $stmt = $pdo->prepare("INSERT INTO pigment_mix_details (mix_id, pigment_id, parts, percentage) VALUES (:mix_id, :pigment_id, :parts, :percentage)");

    foreach ($pigments as $pigment) {
        $stmt->execute([
            ':mix_id' => $mixId,
            ':pigment_id' => $pigment['pigment_id'],
            ':parts' => $pigment['parts'],
            ':percentage' => $pigment['percentage']
        ]);
    }

    $pdo->commit();

    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>