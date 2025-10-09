-- Database optimization for palette formula lookups
-- Run this on production to improve query performance

-- Add index on pigment_mixes for faster filtering
-- This will speed up the WHERE clause: pm.type = 'virtual' AND pm.palette_id = ?
CREATE INDEX idx_pigment_mixes_palette_type
ON pigment_mixes(palette_id, type);

-- Add index on swatch_color_models for faster cached lookups
CREATE INDEX idx_swatch_color_models_lookup
ON swatch_color_models(swatch_id, palette_id);

-- Check if mix data exists for each palette
SELECT
  cp.id as palette_id,
  cp.name as palette_name,
  COUNT(pm.mix_id) as virtual_mix_count
FROM color_palettes cp
LEFT JOIN pigment_mixes pm ON cp.id = pm.palette_id AND pm.type = 'virtual'
GROUP BY cp.id, cp.name
ORDER BY cp.id;
