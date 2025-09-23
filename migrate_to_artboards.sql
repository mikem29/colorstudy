-- Migration to support artboards as parent containers with multiple images

-- Create artboards table
CREATE TABLE IF NOT EXISTS artboards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) DEFAULT 'Untitled Artboard',
  width_inches DECIMAL(8,2) DEFAULT 8.50,
  height_inches DECIMAL(8,2) DEFAULT 11.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add artboard_id to images table
ALTER TABLE images
ADD COLUMN artboard_id INT AFTER id,
ADD FOREIGN KEY (artboard_id) REFERENCES artboards(id) ON DELETE CASCADE;

-- Update swatches to reference both artboard and image
ALTER TABLE swatches
ADD COLUMN artboard_id INT AFTER image_id,
ADD FOREIGN KEY (artboard_id) REFERENCES artboards(id) ON DELETE CASCADE;

-- Migrate existing data: Create artboards for existing images
INSERT INTO artboards (id, name, width_inches, height_inches, created_at)
SELECT
  id,
  CONCAT('Artboard ', id),
  artboard_width_inches,
  artboard_height_inches,
  uploaded_at
FROM images;

-- Update images with their artboard references (each image gets its own artboard initially)
UPDATE images
SET artboard_id = id;

-- Update swatches with artboard references
UPDATE swatches s
JOIN images i ON s.image_id = i.id
SET s.artboard_id = i.id;