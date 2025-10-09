<?php
// Enable error reporting for debugging (remove or comment out in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include the database connection and necessary functions
require 'db_connect.php';
require 'image_functions.php';

// Set the response header to JSON
header('Content-Type: application/json');

// Set the directories for uploads and thumbnails
$target_dir = "uploads/";
$thumbnail_dir = "uploads/thumbnails/";

// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Initialize variables
    $uploadOk = 1;
    $maxFileSize = 15 * 1024 * 1024; // 15 MB
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];

    // Check if file input is set and a file was uploaded
    if (isset($_FILES["fileToUpload"]) && $_FILES["fileToUpload"]["error"] !== UPLOAD_ERR_NO_FILE) {
        // Get file info
        $fileName = basename($_FILES["fileToUpload"]["name"]);
        $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $fileSize = $_FILES["fileToUpload"]["size"];
        $tmpFile = $_FILES["fileToUpload"]["tmp_name"];

        // Verify file extension
        if (!in_array($fileType, $allowedTypes)) {
            echo json_encode(["status" => "error", "message" => "Only JPG, JPEG, PNG, and GIF files are allowed."]);
            exit;
        }

        // Verify file size
        if ($fileSize > $maxFileSize) {
            echo json_encode(["status" => "error", "message" => "File size exceeds the 15MB limit."]);
            exit;
        }

        // Verify the image is a real image
        $check = getimagesize($tmpFile);
        if ($check === false) {
            echo json_encode(["status" => "error", "message" => "File is not an actual image."]);
            exit;
        }

        // Generate a unique name for the file
        $newFileName = $target_dir . uniqid('', true) . "." . $fileType;

        // Move the file to the target directory
        if (move_uploaded_file($tmpFile, $newFileName)) {
            // Generate and save the thumbnail
            $thumbnailPath = $thumbnail_dir . 'thumb_' . basename($newFileName);
            generateThumbnail($newFileName, $thumbnailPath);

            // Save the file path into the database
            try {
                $stmt = $pdo->prepare("INSERT INTO images (file_path) VALUES (:file_path)");
                $stmt->bindParam(':file_path', $newFileName);
                $stmt->execute();
                $imageId = $pdo->lastInsertId();

                echo json_encode([
                    "status" => "success",
                    "message" => "Image uploaded successfully.",
                    "image_id" => $imageId,
                    "thumbnail_path" => $thumbnailPath
                ]);
            } catch (PDOException $e) {
                echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Sorry, there was an error uploading your file."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No file was uploaded."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}