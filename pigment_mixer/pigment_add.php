<?php
// Include the database connection file
include 'db_connect.php';

$successMessage = '';

// Handle form submission for adding a new pigment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'];
    $color_hex = $_POST['color_hex'];
    $r = intval($_POST['r']);
    $g = intval($_POST['g']);
    $b = intval($_POST['b']);
    $type = 'Base'; // Default to Base
    $description = $_POST['description'];

    // Insert the new pigment into the database using PDO
    $sql = "INSERT INTO pigments (name, color_hex, r, g, b, type, description)
            VALUES (:name, :color_hex, :r, :g, :b, :type, :description)";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':name' => $name,
            ':color_hex' => $color_hex,
            ':r' => $r,
            ':g' => $g,
            ':b' => $b,
            ':type' => $type,
            ':description' => $description
        ]);
        $successMessage = "New pigment added successfully.";
    } catch (PDOException $e) {
        echo "Error: " . htmlspecialchars($e->getMessage());
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Add Pigment</title>
    <!-- Include Bootstrap CSS from CDN -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    
    <script>
        function hexToRgb(hex) {
            hex = hex.replace(/^#/, '');
            let bigint = parseInt(hex, 16);
            let r = (bigint >> 16) & 255;
            let g = (bigint >> 8) & 255;
            let b = bigint & 255;
            return { r, g, b };
        }

        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        }

        function updateValues() {
            const hexInput = document.querySelector('input[name="color_hex"]');
            const rInput = document.querySelector('input[name="r"]');
            const gInput = document.querySelector('input[name="g"]');
            const bInput = document.querySelector('input[name="b"]');
            const colorSwatch = document.getElementById('color-swatch');

            function updateSwatch() {
                if (hexInput.value.length === 7) {
                    colorSwatch.style.backgroundColor = hexInput.value;
                } else if (rInput.value && gInput.value && bInput.value) {
                    colorSwatch.style.backgroundColor = rgbToHex(parseInt(rInput.value), parseInt(gInput.value), parseInt(bInput.value));
                } else {
                    colorSwatch.style.backgroundColor = '#FFFFFF'; // Default to white
                }
            }

            hexInput.addEventListener('input', function() {
                if (hexInput.value.length === 7) {
                    const { r, g, b } = hexToRgb(hexInput.value);
                    rInput.value = r;
                    gInput.value = g;
                    bInput.value = b;
                }
                updateSwatch();
            });

            rInput.addEventListener('input', function() {
                const rgbValues = rInput.value.split(',').map(val => val.trim());
                if (rgbValues.length === 3) {
                    rInput.value = rgbValues[0];
                    gInput.value = rgbValues[1];
                    bInput.value = rgbValues[2];
                }
                if (rInput.value && gInput.value && bInput.value) {
                    hexInput.value = rgbToHex(parseInt(rInput.value), parseInt(gInput.value), parseInt(bInput.value));
                }
                updateSwatch();
            });

            [gInput, bInput].forEach(input => {
                input.addEventListener('input', function() {
                    if (rInput.value && gInput.value && bInput.value) {
                        hexInput.value = rgbToHex(parseInt(rInput.value), parseInt(gInput.value), parseInt(bInput.value));
                    }
                    updateSwatch();
                });
            });
        }

        document.addEventListener('DOMContentLoaded', updateValues);
    </script>
</head>
<body>

<?php include 'header.php'; ?> <!-- Include the header here -->

    <div class="container mt-3">
        <h1 class="mb-3 text-center">Add New Pigment</h1>
        
        <?php if (!empty($successMessage)): ?>
            <div class="alert alert-success text-center" role="alert">
                <?php echo $successMessage; ?>
            </div>
        <?php endif; ?>

        <div id="color-swatch" class="mb-2" style="width: 50px; height: 50px; border: 1px solid #000; background-color: #FFFFFF;"></div>
        <form method="post" action="">
            <div class="form-group">
                <input type="text" class="form-control" name="name" placeholder="Name" required>
            </div>

            <div class="form-group">
                <input type="text" class="form-control" name="color_hex" placeholder="Color Hex (#RRGGBB)" required>
            </div>

            <div class="form-row">
                <div class="col">
                    <input type="text" class="form-control" name="r" placeholder="Red" required>
                </div>
                <div class="col">
                    <input type="text" class="form-control" name="g" placeholder="Green" required>
                </div>
                <div class="col">
                    <input type="text" class="form-control" name="b" placeholder="Blue" required>
                </div>
            </div>

            <div class="form-group mt-2">
                <input type="hidden" class="form-control" name="type" value="Base" required>
            </div>

            <div class="form-group">
                <textarea class="form-control" name="description" placeholder="Description"></textarea>
            </div>

            <button type="submit" class="btn btn-primary">Add Pigment</button>
        </form>
    </div>
</body>
</html>
