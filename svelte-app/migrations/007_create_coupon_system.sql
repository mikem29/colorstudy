-- Create coupon/promotion system
-- Supports multiple promotion types with flexible structure

CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('upgrade_pro', 'discount_percentage', 'discount_fixed', 'trial_extension') NOT NULL DEFAULT 'upgrade_pro',
  value DECIMAL(10,2) NULL COMMENT 'Discount amount or percentage (NULL for upgrade_pro)',
  max_uses INT NOT NULL DEFAULT 1 COMMENT 'Maximum number of times this coupon can be used',
  used_count INT NOT NULL DEFAULT 0 COMMENT 'Current number of uses',
  active BOOLEAN NOT NULL DEFAULT true COMMENT 'Whether coupon is currently active',
  expires_at TIMESTAMP NULL COMMENT 'Optional expiration date',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (active),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Flexible coupon/promotion system';

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_coupon (user_id, coupon_id) COMMENT 'Prevent same user from using same coupon twice',
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tracks coupon usage per user';
