<?php
// Include the database connection
require 'db_connect.php';

// Get the image_id from the query parameter
$imageId = isset($_GET['image_id']) ? intval($_GET['image_id']) : null;

// If no image_id is provided, redirect to upload image page
if (!$imageId) {
  header("Location: uploadimage.php");
  exit;
}

// Fetch the image path from the database
$stmt = $pdo->prepare("SELECT file_path FROM images WHERE id = :id");
$stmt->bindParam(':id', $imageId, PDO::PARAM_INT);
$stmt->execute();
$image = $stmt->fetch();

if (!$image) {
  // If image not found, redirect to upload image page
  header("Location: uploadimage.php");
  exit;
}

// Fetch existing swatches for this image
$stmtSwatches = $pdo->prepare("SELECT id, hex_color, red, green, blue, cmyk, description FROM swatches WHERE image_id = :image_id");
$stmtSwatches->bindParam(':image_id', $imageId, PDO::PARAM_INT);
$stmtSwatches->execute();
$swatches = $stmtSwatches->fetchAll(PDO::FETCH_ASSOC);

// Pass the image path and swatches to JavaScript
$imageSrc = htmlspecialchars($image['file_path'], ENT_QUOTES, 'UTF-8');
$swatchesJson = json_encode($swatches);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SwatchSnap</title>
  <link rel="stylesheet" href="style.css">
  <!-- Include Font Awesome Pro -->
</head>
<body>

<div id="header">
  <h1>SwatchSnap</h1>
  <div id="controls">
    <label for="sampling-size">Sampling Size:</label>
    <select id="sampling-size">
      <option value="1">Point Sample</option>
      <option value="3">3x3 Average</option>
      <option value="5">5x5 Average</option>
      <option value="11">11x11 Average</option>
      <option value="31">31x31 Average</option>
      <option value="51">51x51 Average</option>
      <option value="101">101x101 Average</option>
    </select>

    <label for="color-format">Color Format:</label>
    <select id="color-format">
      <option value="RGB">RGB</option>
      <option value="HEX">HEX</option>
      <option value="CMYK">CMYK</option>
    </select>

    <a href="uploadimage.php" id="upload-image-link">Swatches</a>
  </div>
</div>

<div id="main-content">
  <div id="content-wrapper">
    <div id="image-container">
      <div id="loading-overlay">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <canvas id="imageCanvas"></canvas>
      <canvas id="overlayCanvas"></canvas>
      <div id="color-preview"></div>
    </div>

    <!-- Swatch Container Positioned Below Image -->
    <div id="swatch-container">
      <!-- Existing swatches will be dynamically added here -->
    </div>
  </div>
</div>

<!-- Modal Structure -->
<div id="modal">
  <div id="modal-content">
    <span id="modal-close">&times;</span>
    <div id="modal-body">
      <div id="selected-color"></div>
      <div id="color-values">
        <div id="rgb-value"></div>
        <div id="hex-value"></div>
        <div id="cmyk-value"></div>
      </div>
    </div>
    <form id="modal-form">
      <input type="text" id="modal-input" placeholder="Enter Description">
      <button type="submit" id="modal-button">Add Swatch</button>
    </form>
  </div>
</div>

<script>
  // Pass PHP variables to JavaScript
  const imageSrc = '<?php echo $imageSrc; ?>';
  const imageId = <?php echo $imageId; ?>;
  const existingSwatches = <?php echo $swatchesJson; ?>;
</script>
<script src="colorPicker.js"></script>

</body>
</html>