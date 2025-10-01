-- Migration: Add line_color to swatches table
-- Created: 2025-10-01
-- Description: Adds line_color column to swatches table for customizable connection line colors

ALTER TABLE swatches
ADD COLUMN line_color VARCHAR(7) DEFAULT '#000000' COMMENT 'Hex color for the connection line from swatch to sample point';
