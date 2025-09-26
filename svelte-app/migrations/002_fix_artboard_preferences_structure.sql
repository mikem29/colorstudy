-- Migration: Fix artboard preferences structure
-- Created: 2024-09-26
-- Description: Remove user_id from artboard_preferences as preferences are per-artboard not per-user

DROP TABLE IF EXISTS artboard_preferences;