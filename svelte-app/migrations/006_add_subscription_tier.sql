-- Add subscription tier to user table
-- free tier: limited to 5 artboards
-- paid tier: unlimited artboards

ALTER TABLE user
ADD COLUMN subscription_tier ENUM('free', 'paid') NOT NULL DEFAULT 'free' AFTER email;
