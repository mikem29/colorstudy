import mysql from 'mysql2/promise';
import { json } from '@sveltejs/kit';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'm29user',
  password: 'm29Pa55word',
  database: 'colorstudy'
};

// Get all swatches for an artboard
export async function GET({ params }) {
  try {
    const { id } = params;
    const connection = await mysql.createConnection(dbConfig);

    // Get all swatches for this artboard (both direct artboard_id and via image_id)
    const [rows] = await connection.execute(`
      SELECT s.* FROM swatches s
      LEFT JOIN images i ON s.image_id = i.id
      WHERE s.artboard_id = ? OR i.artboard_id = ?
      ORDER BY s.created_at
    `, [id, id]);

    await connection.end();

    return json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching artboard swatches:', error);
    return json({ status: 'error', message: 'Failed to fetch swatches.' }, { status: 500 });
  }
}