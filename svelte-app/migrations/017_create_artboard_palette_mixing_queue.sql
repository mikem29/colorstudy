-- Migration: Create table to track which palettes need mixing for each artboard
-- This allows queuing multiple palettes for background processing

CREATE TABLE IF NOT EXISTS artboard_palette_mixing_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  artboard_id INT NOT NULL,
  palette_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  swatches_total INT DEFAULT 0,
  swatches_processed INT DEFAULT 0,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (artboard_id) REFERENCES artboards(id) ON DELETE CASCADE,
  FOREIGN KEY (palette_id) REFERENCES color_palettes(id) ON DELETE CASCADE,

  -- Ensure we don't queue the same palette twice for the same artboard
  UNIQUE KEY unique_artboard_palette (artboard_id, palette_id),

  INDEX idx_status (status),
  INDEX idx_artboard_id (artboard_id),
  INDEX idx_palette_id (palette_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Artboard palette mixing queue table created!' as status;
