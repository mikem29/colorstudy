import mysql from 'mysql2/promise';
import { json } from '@sveltejs/kit';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'm29user',
  password: 'm29Pa55word',
  database: 'colorstudy'
};

// Get all palettes grouped by image
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Get distinct images with their swatches
    const [rows] = await connection.execute(`
      SELECT
        i.id as image_id,
        SUBSTRING_INDEX(i.file_path, '/', -1) as filename,
        SUBSTRING_INDEX(i.file_path, '/', -1) as original_name,
        i.uploaded_at as upload_date,
        COUNT(s.id) as swatch_count,
        SUBSTRING_INDEX(GROUP_CONCAT(s.hex_color ORDER BY s.created_at), ',', 5) as preview_colors
      FROM images i
      LEFT JOIN swatches s ON i.id = s.image_id
      GROUP BY i.id
      ORDER BY i.uploaded_at DESC
    `);

    await connection.end();

    return json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching palettes:', error);
    return json({ status: 'error', message: 'Failed to fetch palettes.' }, { status: 500 });
  }
}

// Create new palette
export async function POST({ request }) {
  try {
    const { filename, artboard_width_inches = 8.5, artboard_height_inches = 11.0 } = await request.json();

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'INSERT INTO images (file_path, artboard_width_inches, artboard_height_inches) VALUES (?, ?, ?)',
      [filename, artboard_width_inches, artboard_height_inches]
    );

    await connection.end();

    return json({
      status: 'success',
      message: 'Palette created successfully.',
      image_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating palette:', error);
    return json({ status: 'error', message: 'Failed to create palette.' }, { status: 500 });
  }
}