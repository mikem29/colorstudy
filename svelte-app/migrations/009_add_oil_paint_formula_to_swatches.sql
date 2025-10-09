-- Migration: Add oil_paint_formula column to swatches table
-- This allows storing the pigment mixing formula alongside each swatch

ALTER TABLE swatches ADD COLUMN oil_paint_formula TEXT NULL AFTER cmyk;

SELECT 'Oil paint formula column added to swatches table!' as status;
