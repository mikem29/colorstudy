import { json } from '@sveltejs/kit';
import { getConnection } from '$lib/server/db';

// Delete individual image
export async function DELETE({ params }) {
  try {
    const { id } = params;

    const connection = await getConnection();

    // Delete associated swatches first (foreign key relationship)
    await connection.execute('DELETE FROM swatches WHERE image_id = ?', [id]);

    // Delete the image record
    const [result] = await connection.execute('DELETE FROM images WHERE id = ?', [id]);

    await connection.end();

    if (result.affectedRows > 0) {
      return json({ status: 'success', message: 'Image deleted successfully.' });
    } else {
      return json({ status: 'error', message: 'Image not found.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return json({ status: 'error', message: 'Failed to delete image.' }, { status: 500 });
  }
}