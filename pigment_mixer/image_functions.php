<?php
// Function to generate thumbnails using the GD library
function generateThumbnail($sourceImagePath, $thumbnailPath, $thumbWidth = 200, $thumbHeight = 150)
{
    if (!file_exists($thumbnailPath)) {
        // Get the original image size
        list($width, $height) = getimagesize($sourceImagePath);

        // Calculate the scaling factor
        $scalingFactor = min($thumbWidth / $width, $thumbHeight / $height);
        $newWidth = round($width * $scalingFactor);
        $newHeight = round($height * $scalingFactor);

        // Create a new blank image with desired thumbnail dimensions
        $thumbnail = imagecreatetruecolor($newWidth, $newHeight);

        // Load the source image based on its file extension
        $fileExtension = strtolower(pathinfo($sourceImagePath, PATHINFO_EXTENSION));

        switch ($fileExtension) {
            case 'jpg':
            case 'jpeg':
                $sourceImage = imagecreatefromjpeg($sourceImagePath);
                break;
            case 'png':
                $sourceImage = imagecreatefrompng($sourceImagePath);
                break;
            case 'gif':
                $sourceImage = imagecreatefromgif($sourceImagePath);
                break;
            default:
                return false; // Unsupported image type
        }

        // Copy and resize the image to the thumbnail
        imagecopyresampled($thumbnail, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        // Save the thumbnail to disk
        switch ($fileExtension) {
            case 'jpg':
            case 'jpeg':
                imagejpeg($thumbnail, $thumbnailPath, 90); // Save as JPEG
                break;
            case 'png':
                imagepng($thumbnail, $thumbnailPath, 9); // Save as PNG
                break;
            case 'gif':
                imagegif($thumbnail, $thumbnailPath); // Save as GIF
                break;
        }

        // Free up memory
        imagedestroy($sourceImage);
        imagedestroy($thumbnail);
    }
}