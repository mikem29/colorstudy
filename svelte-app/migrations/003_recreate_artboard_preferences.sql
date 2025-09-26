-- Migration: Recreate artboard preferences with correct structure
-- Created: 2024-09-26
-- Description: Create artboard_preferences table without user_id

CREATE TABLE artboard_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artboard_id INT NOT NULL UNIQUE,
    show_connection_lines BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);