-- Migration: Create pigment mixing system tables
-- This adds support for managing pigments and creating virtual/analog color mixes

-- Pigments table
CREATE TABLE IF NOT EXISTS pigments (
    pigment_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    r INT NOT NULL CHECK (r >= 0 AND r <= 255),
    g INT NOT NULL CHECK (g >= 0 AND g <= 255),
    b INT NOT NULL CHECK (b >= 0 AND b <= 255),
    type ENUM('Base','White','Black','Tint') NOT NULL DEFAULT 'Base',
    description TEXT,
    user_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL,
    INDEX idx_pigments_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pigment mixes table (stores virtual and analog color mixes)
CREATE TABLE IF NOT EXISTS pigment_mixes (
    mix_id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('virtual','analog') NOT NULL,
    final_rgb VARCHAR(11) NOT NULL,
    user_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL,
    INDEX idx_pigment_mixes_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pigment mix details (junction table linking mixes to pigments with ratios)
CREATE TABLE IF NOT EXISTS pigment_mix_details (
    detail_id INT PRIMARY KEY AUTO_INCREMENT,
    mix_id INT NOT NULL,
    pigment_id INT NOT NULL,
    parts INT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    user_id VARCHAR(255) NULL,
    FOREIGN KEY (mix_id) REFERENCES pigment_mixes(mix_id) ON DELETE CASCADE,
    FOREIGN KEY (pigment_id) REFERENCES pigments(pigment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL,
    INDEX idx_mix_id (mix_id),
    INDEX idx_pigment_id (pigment_id),
    INDEX idx_pigment_mix_details_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Pigment system tables created successfully!' as status;
