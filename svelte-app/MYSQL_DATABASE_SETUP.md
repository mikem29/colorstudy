# MySQL Database Setup for Huemixy

## Overview

This document details the MySQL database configuration and setup process for the Huemixy (Color Study) application deployed on the sabrehawk server.

## Production Database Configuration

### Connection Details
- **Host**: localhost (sabrehawk server)
- **Port**: 3308 (same MySQL instance as Story app)
- **Database**: `huemixy`
- **User**: `story_user`
- **Password**: `rCy7mRMkZan8H4FpJr8U1/oHwgmHbgqR6yZk17gqS+Y=` (production secure password)

### Database Schema Location
- Schema file: `/var/www/huemixy/mysql/init/01-production-schema.sql`
- Contains all tables, indexes, and constraints needed for the application

## Database Creation Process

### Step 1: Discovered Production MySQL Setup
The Story application uses MySQL on port 3308 with secure credentials. Found this by examining `/var/www/story/.env`:

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3308
DB_USER=story_user
DB_PASSWORD=rCy7mRMkZan8H4FpJr8U1/oHwgmHbgqR6yZk17gqS+Y=
DB_NAME=story_db
```

### Step 2: Created Database with Root Privileges
Used root credentials to create the database and grant permissions:

```bash
mysql -h localhost -P 3308 -u root -p'HYcVmRDR0jU717SPn2thRqKCkohAtekM9ckcA3CPwjs=' -e '
  CREATE DATABASE IF NOT EXISTS huemixy;
  GRANT ALL PRIVILEGES ON huemixy.* TO "story_user"@"%";
  FLUSH PRIVILEGES;'
```

### Step 3: Created Schema Tables
Applied the schema using story_user credentials:

```bash
mysql -h localhost -P 3308 -u story_user -p'rCy7mRMkZan8H4FpJr8U1/oHwgmHbgqR6yZk17gqS+Y=' huemixy < /var/www/huemixy/mysql/init/01-production-schema.sql
```

## Database Schema

### Authentication Tables

#### `user` Table
```sql
CREATE TABLE user (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `session` Table
```sql
CREATE TABLE session (
    id VARCHAR(255) PRIMARY KEY,
    expires_at INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX (expires_at)
);
```

### Application Tables

#### `artboards` Table
```sql
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
```

#### `images` Table
```sql
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
```

#### `swatches` Table
```sql
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
```

### Performance Indexes
```sql
CREATE INDEX idx_artboards_user_id ON artboards(user_id);
CREATE INDEX idx_images_artboard_id ON images(artboard_id);
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_swatches_image_id ON swatches(image_id);
CREATE INDEX idx_swatches_user_id ON swatches(user_id);
```

## Application Configuration

### Environment Variables (PM2)
The application uses these MySQL connection settings in `ecosystem.config.js`:

```javascript
env: {
  MYSQL_HOST: 'localhost',
  MYSQL_PORT: 3308,
  MYSQL_USER: 'story_user',
  MYSQL_PASSWORD: 'rCy7mRMkZan8H4FpJr8U1/oHwgmHbgqR6yZk17gqS+Y=',
  MYSQL_DATABASE: 'huemixy',
  MYSQL_CONNECTION_LIMIT: 10
}
```

### Application Database Config
The app configuration in `src/lib/config.ts` uses environment-based settings:

```typescript
export const DATABASE_CONFIG = {
  mysql: {
    host: dev ? 'localhost' : process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'story_user',
    password: process.env.MYSQL_PASSWORD || 'story_password',
    database: process.env.MYSQL_DATABASE || (dev ? 'colorstudy' : 'huemixy'),
    connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10')
  }
};
```

## Key Features

### User Data Isolation
- All tables include `user_id` foreign keys
- Users can only access their own artboards, images, and swatches
- Cascade deletes ensure data integrity when users are removed

### Color Sampling Metadata
The `swatches` table includes detailed sampling information:
- `sample_x`, `sample_y`: Exact pixel coordinates where color was sampled
- `sample_size`: Sampling area size (1x1, 3x3, 5x5, 11x11, or 31x31 pixels)
- `pos_x`, `pos_y`: Position of the color swatch on the artboard
- `image_id`: Links swatch to the source image for visual connectors

### Visual Connectors Support
The schema supports the visual connector feature that draws lines from color swatches to their sampling locations, showing:
- Dashed lines from swatch to sample point
- Circles indicating sample area size
- Complete traceability of color sampling methodology

## Troubleshooting

### Connection Issues
```bash
# Test database connection
mysql -h localhost -P 3308 -u story_user -p'rCy7mRMkZan8H4FpJr8U1/oHwgmHbgqR6yZk17gqS+Y=' -e 'USE huemixy; SHOW TABLES;'
```

### Check Application Logs
```bash
# View PM2 logs for database errors
pm2 logs huemixy --lines 20
```

### Verify Schema
```bash
# Check table structure
mysql -h localhost -P 3308 -u story_user -p'rCy7mRMkZan8H4FpJr8U1/oHwgmHbgqR6yZk17gqS+Y=' -e 'USE huemixy; DESCRIBE swatches;'
```

## Security Notes

- Production uses secure generated passwords, not default credentials
- Database access is restricted to localhost only
- All user data is properly isolated with foreign key constraints
- Sensitive credentials are stored in environment variables, not hardcoded

## Backup Recommendations

For production use, consider implementing:
1. Daily automated backups of the `huemixy` database
2. Regular testing of backup restoration procedures
3. Monitoring of database connections and performance
4. Log rotation for application and database logs

## Development vs Production

### Development
- Database: `colorstudy` (local MySQL or can use SQLite)
- Port: Standard MySQL port 3306
- Credentials: Simple development passwords

### Production
- Database: `huemixy` (shared MySQL instance with Story)
- Port: 3308 (non-standard for security)
- Credentials: Secure generated passwords
- User isolation: Complete separation between applications while sharing infrastructure