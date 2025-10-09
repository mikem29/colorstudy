-- Add separate RGB columns for faster distance calculations
ALTER TABLE pigment_mixes
  ADD COLUMN final_r TINYINT UNSIGNED NULL AFTER final_rgb,
  ADD COLUMN final_g TINYINT UNSIGNED NULL AFTER final_r,
  ADD COLUMN final_b TINYINT UNSIGNED NULL AFTER final_g;

-- Populate from existing final_rgb string
UPDATE pigment_mixes
SET
  final_r = CAST(SUBSTRING_INDEX(final_rgb, ',', 1) AS UNSIGNED),
  final_g = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(final_rgb, ',', 2), ',', -1) AS UNSIGNED),
  final_b = CAST(SUBSTRING_INDEX(final_rgb, ',', -1) AS UNSIGNED)
WHERE final_r IS NULL;

-- Add index on RGB columns for faster spatial queries
CREATE INDEX idx_pigment_mixes_rgb ON pigment_mixes(palette_id, type, final_r, final_g, final_b);
