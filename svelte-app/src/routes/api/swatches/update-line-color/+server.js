import { json } from '@sveltejs/kit';
import { getConnection } from '$lib/server/db';

export async function POST({ request }) {
  try {
    const { swatch_id, line_color } = await request.json();

    if (!swatch_id || !line_color) {
      return json({ status: 'error', message: 'Missing required fields.' }, { status: 400 });
    }

    // Validate hex color format
    if (!/^#[0-9A-Fa-f]{6}$/.test(line_color)) {
      return json({ status: 'error', message: 'Invalid hex color format.' }, { status: 400 });
    }

    const connection = await getConnection();

    const [result] = await connection.execute(
      'UPDATE swatches SET line_color = ? WHERE id = ?',
      [line_color, swatch_id]
    );

    await connection.end();

    if (result.affectedRows > 0) {
      return json({ status: 'success', message: 'Line color updated successfully.' });
    } else {
      return json({ status: 'error', message: 'Swatch not found.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating swatch line color:', error);
    return json({ status: 'error', message: 'Server error occurred.' }, { status: 500 });
  }
}
