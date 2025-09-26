-- Migration: Add show color format on swatch preference
-- Created: 2024-09-26
-- Description: Adds show_color_format_on_swatch column to artboard_preferences table

ALTER TABLE artboard_preferences
ADD COLUMN show_color_format_on_swatch BOOLEAN DEFAULT TRUE;