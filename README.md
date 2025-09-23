# Color Study Application - Svelte 5 Version

This application has been converted from PHP to Svelte 5 while maintaining the same color picker functionality and MySQL database integration.

## Features

- Interactive color picker with image canvas
- Multiple sampling sizes (point sample to 101x101 average)
- Color format display (RGB/CMYK)
- Color swatch management with descriptions
- Database persistence of color swatches
- Real-time color preview bubble

## Setup Instructions

### 1. Start MySQL Database

```bash
# Start the MySQL container with your existing database
docker-compose up -d
```

This will:
- Create a MySQL 8.0 container
- Import your existing `colorstudy.sql` database
- Make the database available on port 3306

### 2. Install and Run Svelte Application

```bash
# Navigate to the Svelte app directory
cd svelte-app

# Install dependencies
npm install --force

# Start the development server
npm run dev
```

The application will be available at: http://localhost:5173

### 3. Verify Database Connection

Test that the database is working:

```bash
# Check if MySQL is running
docker ps

# Verify tables exist
docker exec colorstudy_mysql mysql -u m29user -pm29Pa55word -e "SHOW TABLES;" colorstudy

# Check existing swatches
docker exec colorstudy_mysql mysql -u m29user -pm29Pa55word -e "SELECT COUNT(*) FROM swatches;" colorstudy
```

## Application Structure

### Backend (API Routes)
- `svelte-app/src/routes/api/swatches/+server.js` - RESTful API for swatch management

### Frontend (Svelte Components)
- `svelte-app/src/routes/+page.svelte` - Main page
- `svelte-app/src/lib/ColorPicker.svelte` - Main color picker component
- `svelte-app/src/app.css` - Styling (converted from original CSS)

### Database
- Uses your existing `colorstudy.sql` database
- Connects to the `swatches` table for persistence
- Maintains compatibility with existing data

## Usage

1. Open the application in your browser (http://localhost:5173)
2. Click on any point in the image to pick a color
3. Adjust sampling size and color format as needed
4. Enter a description for the color in the modal
5. Click "Add Swatch" to save to the database
6. Use "Save Swatches" button to persist all swatches to MySQL

## Database Configuration

The application connects to MySQL with these settings:
- Host: localhost
- Port: 3306
- Database: colorstudy
- User: m29user
- Password: m29Pa55word

## Development

To modify the application:
1. Edit Svelte components in `svelte-app/src/`
2. The development server will automatically reload
3. API endpoints are in `svelte-app/src/routes/api/`

## Migration from PHP

This Svelte version maintains full feature parity with the original PHP application:
- ✅ Canvas-based color picking
- ✅ Multiple sampling sizes
- ✅ RGB/CMYK color formats
- ✅ Swatch management
- ✅ Database persistence
- ✅ Real-time color preview
- ✅ Modal dialogs for descriptions

The main benefits of the Svelte version:
- Modern reactive UI framework
- Better performance
- Improved maintainability
- Component-based architecture