<?php
// Include the database connection file
include 'db_connect.php';

// Function to get all pigments from the database
function getPigments($conn) {
    $sql = "SELECT pigment_id, name FROM pigments";
    $result = $conn->query($sql);
    $pigments = [];
    while ($row = $result->fetch_assoc()) {
        $pigments[] = $row;
    }
    return $pigments;
}

// Function to calculate mixed color
function mixColors($color1, $color2, $ratio) {
    // Calculate RGB components based on the mixing ratio
    $r = round($color1['r'] * $ratio + $color2['r'] * (1 - $ratio));
    $g = round($color1['g'] * $ratio + $color2['g'] * (1 - $ratio));
    $b = round($color1['b'] * $ratio + $color2['b'] * (1 - $ratio));
    $color_hex = sprintf("#%02X%02X%02X", $r, $g, $b);
    return ['r' => $r, 'g' => $g, 'b' => $b, 'color_hex' => $color_hex];
}

// Function to generate combinations based on the form input
function generateCombinations($conn, $pigments, $ratios) {
    $colors = [];
    // Retrieve the pigment data from the database
    $pigmentData = [];
    foreach ($pigments as $id) {
        if ($id) { // If pigment is selected
            $sql = "SELECT * FROM pigments WHERE pigment_id = $id";
            $result = $conn->query($sql);
            $pigmentData[] = $result->fetch_assoc();
        }
    }
    // Generate combinations for the first two required pigments
    for ($i = 0; $i <= 20; $i++) {
        $ratio = $i / 20;
        $color = mixColors($pigmentData[0], $pigmentData[1], $ratio);
        $colors[] = $color;
    }
    return $colors;
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $pigment1_id = $_POST['pigment1'];
    $pigment2_id = $_POST['pigment2'];
    $pigment3_id = $_POST['pigment3'];
    $pigment4_id = $_POST['pigment4'];
    $pigment5_id = $_POST['pigment5'];

    $selectedPigments = [$pigment1_id, $pigment2_id, $pigment3_id, $pigment4_id, $pigment5_id];

    // Generate the color combinations
    $generatedColors = generateCombinations($conn, $selectedPigments, 20);

    // Output the generated colors for demonstration
    echo "<h2>Generated Colors:</h2><ul>";
    foreach ($generatedColors as $color) {
        echo "<li style='background-color: {$color['color_hex']};'>{$color['color_hex']} (R: {$color['r']}, G: {$color['g']}, B: {$color['b']})</li>";
    }
    echo "</ul>";
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Color Mixer</title>
</head>
<body>
    <h1>Color Mixer</h1>
    <form method="post" action="">
        <label for="pigment1">Pigment 1 (Required):</label>
        <select name="pigment1" required>
            <option value="">Select Pigment</option>
            <?php foreach (getPigments($conn) as $pigment): ?>
                <option value="<?= $pigment['pigment_id'] ?>"><?= $pigment['name'] ?></option>
            <?php endforeach; ?>
        </select><br>

        <label for="pigment2">Pigment 2 (Required):</label>
        <select name="pigment2" required>
            <option value="">Select Pigment</option>
            <?php foreach (getPigments($conn) as $pigment): ?>
                <option value="<?= $pigment['pigment_id'] ?>"><?= $pigment['name'] ?></option>
            <?php endforeach; ?>
        </select><br>

        <label for="pigment3">Pigment 3 (Optional):</label>
        <select name="pigment3">
            <option value="">Select Pigment</option>
            <?php foreach (getPigments($conn) as $pigment): ?>
                <option value="<?= $pigment['pigment_id'] ?>"><?= $pigment['name'] ?></option>
            <?php endforeach; ?>
        </select><br>

        <label for="pigment4">Pigment 4 (Optional):</label>
        <select name="pigment4">
            <option value="">Select Pigment</option>
            <?php foreach (getPigments($conn) as $pigment): ?>
                <option value="<?= $pigment['pigment_id'] ?>"><?= $pigment['name'] ?></option>
            <?php endforeach; ?>
        </select><br>

        <label for="pigment5">Pigment 5 (Optional):</label>
        <select name="pigment5">
            <option value="">Select Pigment</option>
            <?php foreach (getPigments($conn) as $pigment): ?>
                <option value="<?= $pigment['pigment_id'] ?>"><?= $pigment['name'] ?></option>
            <?php endforeach; ?>
        </select><br>

        <button type="submit">Generate Colors</button>
    </form>
</body>
</html>
