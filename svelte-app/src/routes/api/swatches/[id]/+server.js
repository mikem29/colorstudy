import { json } from '@sveltejs/kit';
import { getConnection } from '$lib/server/db';

export async function GET({ params }) {
  try {
    const { id } = params;

    const connection = await getConnection();

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

    const connection = await getConnection();

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