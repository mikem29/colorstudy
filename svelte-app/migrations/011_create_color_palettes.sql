-- Migration: Create color palettes hierarchy
-- This allows multiple paint systems (Gamblin, Winsor Newton, Watercolors, etc.)

-- 1. Create color_palettes table
CREATE TABLE IF NOT EXISTS color_palettes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('oil', 'watercolor', 'acrylic', 'digital', 'other') NOT NULL,
  description TEXT NULL,
  user_id VARCHAR(255) NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL,
  INDEX idx_palette_user_id (user_id),
  INDEX idx_palette_type (type),
  INDEX idx_palette_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Add palette_id to pigments table
ALTER TABLE pigments
  ADD COLUMN palette_id INT NULL AFTER pigment_id,
  ADD CONSTRAINT fk_pigments_palette
    FOREIGN KEY (palette_id)
    REFERENCES color_palettes(id)
    ON DELETE CASCADE;

CREATE INDEX idx_pigments_palette_id ON pigments(palette_id);

-- 3. Add palette_id to pigment_mixes table
ALTER TABLE pigment_mixes
  ADD COLUMN palette_id INT NULL AFTER mix_id,
  ADD CONSTRAINT fk_mixes_palette
    FOREIGN KEY (palette_id)
    REFERENCES color_palettes(id)
    ON DELETE CASCADE;

CREATE INDEX idx_mixes_palette_id ON pigment_mixes(palette_id);

-- 4. Update swatch_color_models to use palette_id instead of model_type
ALTER TABLE swatch_color_models
  DROP COLUMN model_type,
  ADD COLUMN palette_id INT NULL AFTER swatch_id,
  ADD CONSTRAINT fk_swatch_models_palette
    FOREIGN KEY (palette_id)
    REFERENCES color_palettes(id)
    ON DELETE CASCADE;

CREATE INDEX idx_swatch_models_palette_id ON swatch_color_models(palette_id);

-- Update unique constraint to use palette_id
ALTER TABLE swatch_color_models
  DROP INDEX unique_swatch_model,
  ADD UNIQUE KEY unique_swatch_palette (swatch_id, palette_id);

-- 5. Create default "Virtual Oil Paint Mix" palette
INSERT INTO color_palettes (name, type, description, is_public)
VALUES ('Virtual Oil Paint Mix', 'oil', 'Mixbox algorithm-based virtual oil paint mixing', TRUE);

-- 6. Migrate existing data to use the default palette
SET @default_palette_id = LAST_INSERT_ID();

-- Update existing pigments to belong to default palette
UPDATE pigments SET palette_id = @default_palette_id WHERE palette_id IS NULL;

-- Update existing mixes to belong to default palette
UPDATE pigment_mixes SET palette_id = @default_palette_id WHERE palette_id IS NULL;

SELECT 'Color palettes hierarchy created!' as status;
