-- Migration: Create cross-reference table for swatch color models
-- This allows a swatch to have multiple color representations (RGB, CMYK, Oil Paint, etc.)

CREATE TABLE IF NOT EXISTS swatch_color_models (
  id INT PRIMARY KEY AUTO_INCREMENT,
  swatch_id INT UNSIGNED NOT NULL,
  model_type ENUM('oil_paint', 'cmyk', 'rgb', 'other') NOT NULL,
  mix_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (swatch_id) REFERENCES swatches(id) ON DELETE CASCADE,
  FOREIGN KEY (mix_id) REFERENCES pigment_mixes(mix_id) ON DELETE SET NULL,

  -- Ensure we don't duplicate model types for the same swatch
  UNIQUE KEY unique_swatch_model (swatch_id, model_type),

  INDEX idx_swatch_id (swatch_id),
  INDEX idx_model_type (model_type),
  INDEX idx_mix_id (mix_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Swatch color models cross-reference table created!' as status;
