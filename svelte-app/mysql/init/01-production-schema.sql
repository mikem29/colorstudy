-- Production database setup for Huemixy
-- Create the database and set up authentication tables + colorstudy tables

-- Create the huemixy database
CREATE DATABASE IF NOT EXISTS huemixy;
USE huemixy;

-- User authentication table
CREATE TABLE user (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session table for Lucia authentication
CREATE TABLE session (
    id VARCHAR(255) PRIMARY KEY,
    expires_at INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX (expires_at)
);

-- Artboards table
CREATE TABLE artboards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    width_inches DECIMAL(10,2) NOT NULL DEFAULT 8.5,
    height_inches DECIMAL(10,2) NOT NULL DEFAULT 11.0,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Images table (uploaded images within artboards)
CREATE TABLE images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    artboard_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    image_x DECIMAL(10,2) DEFAULT 0,
    image_y DECIMAL(10,2) DEFAULT 0,
    image_width DECIMAL(10,2) DEFAULT 400,
    image_height DECIMAL(10,2) DEFAULT 300,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artboard_id) REFERENCES artboards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Color swatches table
CREATE TABLE swatches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hex_color VARCHAR(7) NOT NULL,
    red INT NOT NULL CHECK (red >= 0 AND red <= 255),
    green INT NOT NULL CHECK (green >= 0 AND green <= 255),
    blue INT NOT NULL CHECK (blue >= 0 AND blue <= 255),
    cmyk VARCHAR(100),
    description TEXT,
    image_id INT,
    pos_x DECIMAL(10,2) DEFAULT 0,
    pos_y DECIMAL(10,2) DEFAULT 0,
    sample_x DECIMAL(10,2) DEFAULT 0,
    sample_y DECIMAL(10,2) DEFAULT 0,
    sample_size INT DEFAULT 1,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_artboards_user_id ON artboards(user_id);
CREATE INDEX idx_images_artboard_id ON images(artboard_id);
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_swatches_image_id ON swatches(image_id);
CREATE INDEX idx_swatches_user_id ON swatches(user_id);

-- Grant privileges to the application user (replace 'huemixy_user' and password as needed)
-- CREATE USER IF NOT EXISTS 'huemixy_user'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON huemixy.* TO 'huemixy_user'@'localhost';
-- FLUSH PRIVILEGES;

SELECT 'Huemixy database setup completed successfully!' as status;