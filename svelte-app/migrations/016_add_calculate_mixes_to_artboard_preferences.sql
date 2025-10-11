-- Add column to track if mix calculation is enabled for the default palette
ALTER TABLE artboard_preferences ADD COLUMN calculate_mixes BOOLEAN DEFAULT FALSE;
