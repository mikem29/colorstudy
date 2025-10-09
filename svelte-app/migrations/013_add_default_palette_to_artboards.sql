-- Add default palette selection to artboards
ALTER TABLE artboards ADD COLUMN default_palette_id INT NULL;
ALTER TABLE artboards ADD FOREIGN KEY (default_palette_id) REFERENCES color_palettes(id) ON DELETE SET NULL;
