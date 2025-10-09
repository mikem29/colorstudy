<?php
// Enable error reporting for debugging (remove or comment out in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include the database connection and necessary functions
require 'db_connect.php';
require 'image_functions.php';


// Set the directories for uploads and thumbnails
$target_dir = "uploads/";
$thumbnail_dir = "uploads/thumbnails/";

// Create the uploads and thumbnails directories if they don't exist
if (!is_dir($target_dir)) {
  mkdir($target_dir, 0755, true);
}
if (!is_dir($thumbnail_dir)) {
  mkdir($thumbnail_dir, 0755, true);
}

// Handle image deletion
if (isset($_POST['delete_image'])) {
  $imageId = (int)$_POST['delete_image'];
  try {
    // Start a transaction
    $pdo->beginTransaction();

    // Delete associated swatches first
    $stmtDeleteSwatches = $pdo->prepare("DELETE FROM swatches WHERE image_id = :id");
    $stmtDeleteSwatches->bindParam(':id', $imageId);
    $stmtDeleteSwatches->execute();

    // Now delete the image record
    $stmtDeleteImage = $pdo->prepare("DELETE FROM images WHERE id = :id");
    $stmtDeleteImage->bindParam(':id', $imageId);
    $stmtDeleteImage->execute();
    
    // Fetch the file path before deleting the record
    $stmtFetchPath = $pdo->prepare("SELECT file_path FROM images WHERE id = :id");
    $stmtFetchPath->bindParam(':id', $imageId);
    $stmtFetchPath->execute();
    $image = $stmtFetchPath->fetch(PDO::FETCH_ASSOC);
    
    if ($image) {
      $filePath = $image['file_path'];
      $thumbnailPath = $thumbnail_dir . 'thumb_' . basename($filePath);
      
      // Delete the actual image file and its thumbnail
      if (file_exists($filePath)) {
        unlink($filePath);
      }
      if (file_exists($thumbnailPath)) {
        unlink($thumbnailPath);
      }
    }

    // Commit the transaction
    $pdo->commit();
    
    // Redirect to refresh the page
    header("Location: uploadimage.php");
    exit;
  } catch (PDOException $e) {
    // Rollback the transaction on error
    $pdo->rollBack();
    echo "Error deleting image and associated swatches: " . htmlspecialchars($e->getMessage());
  }
}

// Fetch all images from the database
$images = [];
try {
  $stmt = $pdo->query("SELECT id, file_path FROM images");
  $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
  echo "Error fetching images from the database: " . htmlspecialchars($e->getMessage()) . "<br>";
}

// Handle full-size image display if `image_id` is provided
if (isset($_GET['image_id'])) {
  $imageId = (int) $_GET['image_id'];

  // Fetch the image path from the database
  try {
    $stmt = $pdo->prepare("SELECT file_path FROM images WHERE id = :id");
    $stmt->bindParam(':id', $imageId);
    $stmt->execute();
    $image = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($image) {
      // Display the full-size image
      $filePath = $image['file_path'];
      echo "<h1>Full Image</h1>";
      echo "<img src='" . htmlspecialchars($filePath, ENT_QUOTES, 'UTF-8') . "' alt='Full Image' style='max-width: 100%; height: auto;'>";
    } else {
      echo "Image not found.";
    }
  } catch (PDOException $e) {
    echo "Error fetching image: " . htmlspecialchars($e->getMessage());
  }

  // Stop further execution after showing the full-size image
  exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SwatchSnapper</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
<div id="header">
  <h1>SwatchSnapper</h1>
  <button id="upload-image-button" class="md3-button">Upload Image</button>
</div>

<div id="main-content">
  <div class="image-grid" id="image-grid">
    <?php
    // Generate thumbnails for each image and display them in a grid
    foreach ($images as $image) {
      $originalImagePath = $image['file_path'];
      $thumbnailPath = $thumbnail_dir . 'thumb_' . basename($originalImagePath);

      // Generate thumbnail if it doesn't exist
      generateThumbnail($originalImagePath, $thumbnailPath);

      echo "<div class='image-item'>";
      echo "<a href='index.php?image_id=" . $image['id'] . "'>";
      echo "<img src='" . htmlspecialchars($thumbnailPath, ENT_QUOTES, 'UTF-8') . "' alt='Thumbnail'>";
      echo "</a>";
      echo "<form action='uploadimage.php' method='post' class='delete-form'>";
      echo "<input type='hidden' name='delete_image' value='" . $image['id'] . "'>";
      echo "<button type='submit' class='delete-button'>Delete</button>";
      echo "</form>";
      echo "</div>";
    }
    ?>
  </div>
</div>

<!-- Upload Image Modal -->
<div id="upload-modal" class="modal">
  <div class="modal-content">
    <h2>Upload an Image</h2>
    <form id="upload-form" enctype="multipart/form-data">
      <input type="file" name="fileToUpload" id="fileToUpload" accept="image/*" style="display: none;">
      <label for="fileToUpload" class="md3-button">Choose File</label>
      <span id="file-name">No file chosen</span>
    </form>
  </div>
</div>

<script src="uploadimage.js"></script>
</body>
</html>