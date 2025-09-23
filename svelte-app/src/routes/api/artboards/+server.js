import mysql from 'mysql2/promise';
import { json } from '@sveltejs/kit';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'm29user',
  password: 'm29Pa55word',
  database: 'colorstudy'
};

// Get all artboards
export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
      SELECT
        a.id,
        a.name,
        a.width_inches,
        a.height_inches,
        a.created_at,
        COUNT(DISTINCT i.id) as image_count,
        COUNT(DISTINCT s.id) as swatch_count
      FROM artboards a
      LEFT JOIN images i ON a.id = i.artboard_id
      LEFT JOIN swatches s ON a.id = s.artboard_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

    await connection.end();

    return json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching artboards:', error);
    return json({ status: 'error', message: 'Failed to fetch artboards.' }, { status: 500 });
  }
}

// Create new artboard
export async function POST({ request }) {
  try {
    const { name = 'Untitled Artboard', width_inches = 8.5, height_inches = 11.0 } = await request.json();

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'INSERT INTO artboards (name, width_inches, height_inches) VALUES (?, ?, ?)',
      [name, width_inches, height_inches]
    );

    await connection.end();

    return json({
      status: 'success',
      message: 'Artboard created successfully.',
      artboard_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating artboard:', error);
    return json({ status: 'error', message: 'Failed to create artboard.' }, { status: 500 });
  }
}

