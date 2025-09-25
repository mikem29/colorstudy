import { json } from '@sveltejs/kit';
import { getConnection } from '$lib/server/db';

// Get artboard with images and swatches
export async function GET({ params }) {
  try {
    const connection = await getConnection();
    const { id } = params;

    // Get artboard details
    const [artboards] = await connection.execute(
      'SELECT * FROM artboards WHERE id = ?',
      [id]
    );

    if (artboards.length === 0) {
      await connection.end();
      return json({ status: 'error', message: 'Artboard not found.' }, { status: 404 });
    }

    // Get images for this artboard
    const [images] = await connection.execute(
      'SELECT * FROM images WHERE artboard_id = ?',
      [id]
    );

    // Get swatches for this artboard
    const [swatches] = await connection.execute(
      'SELECT * FROM swatches WHERE artboard_id = ? ORDER BY created_at',
      [id]
    );

    await connection.end();

    return json({
      status: 'success',
      data: {
        artboard: artboards[0],
        images,
        swatches
      }
    });
  } catch (error) {
    console.error('Error fetching artboard:', error);
    return json({ status: 'error', message: 'Failed to fetch artboard.' }, { status: 500 });
  }
}

// Add image to artboard
export async function POST({ params, request }) {
  try {
    const { id } = params;
    const { filename, image_x = 0, image_y = 0, image_width, image_height } = await request.json();

    const connection = await getConnection();

    const [result] = await connection.execute(
      'INSERT INTO images (artboard_id, file_path, image_x, image_y, image_width, image_height) VALUES (?, ?, ?, ?, ?, ?)',
      [id, filename, image_x, image_y, image_width, image_height]
    );

    await connection.end();

    return json({
      status: 'success',
      message: 'Image added to artboard.',
      image_id: result.insertId
    });
  } catch (error) {
    console.error('Error adding image to artboard:', error);
    return json({ status: 'error', message: 'Failed to add image.' }, { status: 500 });
  }
}

// Delete artboard
export async function DELETE({ params }) {
  try {
    const { id } = params;
    console.log('DELETE API - Deleting artboard ID:', id);

    const connection = await getConnection();

    // Delete related data first - order matters due to foreign key constraints
    // First delete swatches that might reference images
    console.log('DELETE API - Deleting swatches by artboard_id...');
    const [swatchResult1] = await connection.execute('DELETE FROM swatches WHERE artboard_id = ?', [id]);
    console.log('DELETE API - Deleted', swatchResult1.affectedRows, 'swatches by artboard_id');

    // Also delete swatches that reference images in this artboard
    console.log('DELETE API - Deleting swatches by image_id...');
    const [swatchResult2] = await connection.execute('DELETE swatches FROM swatches INNER JOIN images ON swatches.image_id = images.id WHERE images.artboard_id = ?', [id]);
    console.log('DELETE API - Deleted', swatchResult2.affectedRows, 'swatches by image_id');

    // Now we can safely delete images
    console.log('DELETE API - Deleting images...');
    const [imageResult] = await connection.execute('DELETE FROM images WHERE artboard_id = ?', [id]);
    console.log('DELETE API - Deleted', imageResult.affectedRows, 'images');

    // Delete artboard
    console.log('DELETE API - Deleting artboard...');
    const [result] = await connection.execute('DELETE FROM artboards WHERE id = ?', [id]);
    console.log('DELETE API - Artboard delete result:', result);

    await connection.end();

    if (result.affectedRows === 0) {
      console.log('DELETE API - No artboard found with ID:', id);
      return json({ status: 'error', message: 'Artboard not found.' }, { status: 404 });
    }

    console.log('DELETE API - Successfully deleted artboard');
    return json({
      status: 'success',
      message: 'Artboard deleted successfully.'
    });
  } catch (error) {
    console.error('DELETE API - Error deleting artboard:', error);
    return json({ status: 'error', message: 'Failed to delete artboard.' }, { status: 500 });
  }
}