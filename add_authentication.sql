-- Add authentication tables to colorstudy database
-- Based on Story project's authentication setup

USE colorstudy;

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS user (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for authentication)
CREATE TABLE IF NOT EXISTS session (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    expires_at BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Add user_id to existing tables to associate content with users

-- Add user_id to images table
ALTER TABLE images
ADD COLUMN user_id VARCHAR(255) NULL,
ADD CONSTRAINT fk_images_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL;

-- Add user_id to swatches table
ALTER TABLE swatches
ADD COLUMN user_id VARCHAR(255) NULL,
ADD CONSTRAINT fk_swatches_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL;

-- Add user_id to color_combinations table
ALTER TABLE color_combinations
ADD COLUMN user_id VARCHAR(255) NULL,
ADD CONSTRAINT fk_color_combinations_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL;

-- Add user_id to pigments table
ALTER TABLE pigments
ADD COLUMN user_id VARCHAR(255) NULL,
ADD CONSTRAINT fk_pigments_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL;

-- Add user_id to pigment_mixes table
ALTER TABLE pigment_mixes
ADD COLUMN user_id VARCHAR(255) NULL,
ADD CONSTRAINT fk_pigment_mixes_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL;

-- Add user_id to pigment_mix_details table
ALTER TABLE pigment_mix_details
ADD COLUMN user_id VARCHAR(255) NULL,
ADD CONSTRAINT fk_pigment_mix_details_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_swatches_user_id ON swatches(user_id);
CREATE INDEX idx_color_combinations_user_id ON color_combinations(user_id);
CREATE INDEX idx_pigments_user_id ON pigments(user_id);
CREATE INDEX idx_pigment_mixes_user_id ON pigment_mixes(user_id);
CREATE INDEX idx_pigment_mix_details_user_id ON pigment_mix_details(user_id);
CREATE INDEX idx_session_user_id ON session(user_id);