import mysql from 'mysql2/promise';
import { json } from '@sveltejs/kit';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'm29user',
  password: 'm29Pa55word',
  database: 'colorstudy'
};

export async function POST({ request }) {
  try {
    const { hex_color, image_id, pos_x, pos_y } = await request.json();

    if (!hex_color || !image_id || pos_x === undefined || pos_y === undefined) {
      return json({ status: 'error', message: 'Missing required fields.' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'UPDATE swatches SET pos_x = ?, pos_y = ? WHERE hex_color = ? AND image_id = ?',
      [pos_x, pos_y, hex_color, image_id]
    );

    await connection.end();

    if (result.affectedRows > 0) {
      return json({ status: 'success', message: 'Position updated successfully.' });
    } else {
      return json({ status: 'error', message: 'Swatch not found.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating swatch position:', error);
    return json({ status: 'error', message: 'Server error occurred.' }, { status: 500 });
  }
}