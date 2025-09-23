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
    const swatchData = await request.json();

    if (!Array.isArray(swatchData)) {
      return json({ status: 'error', message: 'Invalid input data.' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    await connection.beginTransaction();

    try {
      const stmt = `INSERT INTO swatches (hex_color, red, green, blue, cmyk, description, image_id, pos_x, pos_y, sample_x, sample_y)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      for (const swatch of swatchData) {
        if (
          !swatch.hex_color ||
          typeof swatch.red !== 'number' ||
          typeof swatch.green !== 'number' ||
          typeof swatch.blue !== 'number' ||
          !swatch.description?.trim()
        ) {
          await connection.rollback();
          await connection.end();
          return json({ status: 'error', message: 'Invalid input data in one or more swatches.' }, { status: 400 });
        }

        await connection.execute(stmt, [
          swatch.hex_color,
          swatch.red,
          swatch.green,
          swatch.blue,
          swatch.cmyk || '',
          swatch.description,
          swatch.image_id || null,
          swatch.pos_x || 0,
          swatch.pos_y || 0,
          swatch.sample_x || 0,
          swatch.sample_y || 0
        ]);
      }

      await connection.commit();
      await connection.end();

      return json({ status: 'success', message: 'Swatches saved successfully.' });
    } catch (error) {
      await connection.rollback();
      await connection.end();
      console.error('Database error:', error);
      return json({ status: 'error', message: 'Database error occurred.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving swatches:', error);
    return json({ status: 'error', message: 'Server error occurred.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute('SELECT * FROM swatches ORDER BY created_at DESC');

    await connection.end();

    return json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching swatches:', error);
    return json({ status: 'error', message: 'Failed to fetch swatches.' }, { status: 500 });
  }
}