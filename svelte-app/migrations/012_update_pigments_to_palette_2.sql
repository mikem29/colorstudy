-- Migration: Update all pigments and mixes to palette_id = 2
-- This assigns all existing pigments and mixes to the correct Oil Paint palette

-- Update all pigments to use palette_id = 2
UPDATE pigments
SET palette_id = 2
WHERE palette_id IS NULL OR palette_id = 1;

-- Update all mixes to use palette_id = 2
UPDATE pigment_mixes
SET palette_id = 2
WHERE palette_id IS NULL OR palette_id = 1;

-- Update swatch_color_models to use palette_id = 2 (if any exist)
UPDATE swatch_color_models
SET palette_id = 2
WHERE palette_id IS NULL OR palette_id = 1;

SELECT 'All pigments and mixes updated to palette_id = 2!' as status;
