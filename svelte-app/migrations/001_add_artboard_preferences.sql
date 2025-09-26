-- Migration: Add artboard preferences
-- Created: 2024-09-26
-- Description: Creates artboard_preferences table for storing per-artboard settings

CREATE TABLE IF NOT EXISTS artboard_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artboard_id INT NOT NULL UNIQUE,
    show_connection_lines BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);