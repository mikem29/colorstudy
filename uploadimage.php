<?php
// Enable error reporting for debugging (remove or comment out in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Set the target directory
  $target_dir = "uploads/";

  // Create the uploads directory if it doesn't exist
  if (!is_dir($target_dir)) {
    mkdir($target_dir, 0755, true);
  }

  // Initialize variables
  $uploadOk = 1;
  $maxFileSize = 15 * 1024 * 1024; // 15 MB
  $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];

  // Check if file input is set and a file was uploaded
  if (isset($_FILES["fileToUpload"]) && $_FILES["fileToUpload"]["error"] !== UPLOAD_ERR_NO_FILE) {

    // Check for upload errors
    if ($_FILES["fileToUpload"]["error"] === UPLOAD_ERR_OK) {
      // Get file info
      $fileName = basename($_FILES["fileToUpload"]["name"]);
      $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
      $fileSize = $_FILES["fileToUpload"]["size"];
      $tmpFile = $_FILES["fileToUpload"]["tmp_name"];

      // Verify file extension
      if (!in_array($fileType, $allowedTypes)) {
        echo "Error: Only JPG, JPEG, PNG, and GIF files are allowed.<br>";
        $uploadOk = 0;
      }

      // Verify file size
      if ($fileSize > $maxFileSize) {
        echo "Error: File size exceeds the 15MB limit.<br>";
        $uploadOk = 0;
      }

      // Verify the image is a real image
      $check = getimagesize($tmpFile);
      if ($check === false) {
        echo "Error: File is not an actual image.<br>";
        $uploadOk = 0;
      }

      // Check if upload is allowed
      if ($uploadOk == 0) {
        echo "Your file was not uploaded.<br>";
      } else {
        // Generate a unique name for the file
        $newFileName = $target_dir . uniqid('', true) . "." . $fileType;

        // Move the file to the target directory
        if (move_uploaded_file($tmpFile, $newFileName)) {
          echo "The file has been uploaded successfully.<br>";
          echo "<img src='" . htmlspecialchars($newFileName, ENT_QUOTES, 'UTF-8') . "' alt='Uploaded Image' style='max-width:300px;'><br>";
        } else {
          echo "Error: There was a problem uploading your file.<br>";
        }
      }
    } else {
      // Handle upload errors
      $error_messages = [
        UPLOAD_ERR_INI_SIZE   => 'The uploaded file exceeds the upload_max_filesize directive in php.ini.',
        UPLOAD_ERR_FORM_SIZE  => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.',
        UPLOAD_ERR_PARTIAL    => 'The uploaded file was only partially uploaded.',
        UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
        UPLOAD_ERR_EXTENSION  => 'A PHP extension stopped the file upload.',
      ];
      $error_code = $_FILES["fileToUpload"]["error"];
      $message = isset($error_messages[$error_code]) ? $error_messages[$error_code] : 'Unknown upload error.';
      echo "Error: $message<br>";
    }
  } else {
    echo "Error: No file was selected for upload.<br>";
  }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Upload Image</title>
</head>
<body>
<h1>Upload an Image</h1>
<form action="uploadimage.php" method="post" enctype="multipart/form-data">
  <label for="fileToUpload">Select image to upload (Max 15MB):</label><br><br>
  <input type="file" name="fileToUpload" id="fileToUpload" accept="image/*"><br><br>
  <input type="submit" value="Upload Image" name="submit">
</form>
</body>
</html>
