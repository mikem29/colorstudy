-- Create the swatches table
CREATE TABLE IF NOT EXISTS swatches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hex_color VARCHAR(7) NOT NULL,
    red INT NOT NULL,
    green INT NOT NULL,
    blue INT NOT NULL,
    cmyk VARCHAR(50),
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);