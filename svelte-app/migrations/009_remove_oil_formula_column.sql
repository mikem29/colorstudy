-- Migration: Remove oil_paint_formula column from swatches table
-- This column is being replaced with a proper cross-reference table

-- Check if column exists and drop it
SET @dbname = DATABASE();
SET @tablename = 'swatches';
SET @columnname = 'oil_paint_formula';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'ALTER TABLE swatches DROP COLUMN oil_paint_formula;',
  'SELECT 1;'
));

PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;

SELECT 'Oil paint formula column removed from swatches table (if it existed)!' as status;
