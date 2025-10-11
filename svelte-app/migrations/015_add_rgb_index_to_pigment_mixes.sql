-- Add index on RGB columns for faster color matching queries
CREATE INDEX idx_pigment_mixes_rgb ON pigment_mixes(final_r, final_g, final_b, type);
