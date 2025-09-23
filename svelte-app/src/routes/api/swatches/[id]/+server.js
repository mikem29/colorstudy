import mysql from 'mysql2/promise';
import { json } from '@sveltejs/kit';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'm29user',
  password: 'm29Pa55word',
  database: 'colorstudy'
};

export async function GET({ params }) {
  try {
    const { id } = params;

    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT * FROM swatches WHERE image_id = ? ORDER BY created_at ASC',
      [id]
    );

    await connection.end();

    return json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching swatches for image:', error);
    return json({ status: 'error', message: 'Failed to fetch swatches.' }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  try {
    const { id } = params;

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute('DELETE FROM swatches WHERE id = ?', [id]);

    await connection.end();

    if (result.affectedRows > 0) {
      return json({ status: 'success', message: 'Swatch deleted successfully.' });
    } else {
      return json({ status: 'error', message: 'Swatch not found.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting swatch:', error);
    return json({ status: 'error', message: 'Server error occurred.' }, { status: 500 });
  }
}