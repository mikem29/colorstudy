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

    // Get swatches for this artboard (via images)
    const [swatches] = await connection.execute(
      `SELECT s.* FROM swatches s
       INNER JOIN images i ON s.image_id = i.id
       WHERE i.artboard_id = ?
       ORDER BY s.created_at`,
      [id]
    );

    console.log('Artboard API: Loaded swatches:', swatches.length);
    if (swatches.length > 0) {
      console.log('Artboard API: First swatch:', swatches[0]);
      console.log('Artboard API: First swatch keys:', Object.keys(swatches[0]));
    }

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
export async function POST({ params, request, locals }) {
  try {
    const { id } = params;
    const { filename, image_x = 0, image_y = 0, image_width, image_height } = await request.json();

    const connection = await getConnection();

    const [result] = await connection.execute(
      'INSERT INTO images (artboard_id, file_path, image_x, image_y, image_width, image_height, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, filename, image_x, image_y, image_width, image_height, locals.user?.id || null]
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

// Update artboard name and/or default palette
export async function PATCH({ params, request }) {
  try {
    const { id } = params;
    const { name, default_palette_id } = await request.json();

    const connection = await getConnection();

    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];

    if (name !== undefined) {
      if (!name || !name.trim()) {
        await connection.end();
        return json({ status: 'error', message: 'Name cannot be empty.' }, { status: 400 });
      }
      updates.push('name = ?');
      values.push(name.trim());
    }

    if (default_palette_id !== undefined) {
      updates.push('default_palette_id = ?');
      values.push(default_palette_id || null);
    }

    if (updates.length === 0) {
      await connection.end();
      return json({ status: 'error', message: 'No fields to update.' }, { status: 400 });
    }

    values.push(id);
    const [result] = await connection.execute(
      `UPDATE artboards SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return json({ status: 'error', message: 'Artboard not found.' }, { status: 404 });
    }

    return json({
      status: 'success',
      message: 'Artboard updated successfully.'
    });
  } catch (error) {
    console.error('Error updating artboard:', error);
    return json({ status: 'error', message: 'Failed to update artboard.' }, { status: 500 });
  }
}

// Delete artboard
export async function DELETE({ params }) {
  try {
    const { id } = params;

    const connection = await getConnection();

    // Delete related data first - order matters due to foreign key constraints
    // First delete swatches that might reference images
    const [swatchResult1] = await connection.execute('DELETE FROM swatches WHERE artboard_id = ?', [id]);

    // Also delete swatches that reference images in this artboard
    const [swatchResult2] = await connection.execute('DELETE swatches FROM swatches INNER JOIN images ON swatches.image_id = images.id WHERE images.artboard_id = ?', [id]);

    // Now we can safely delete images
    const [imageResult] = await connection.execute('DELETE FROM images WHERE artboard_id = ?', [id]);

    // Delete artboard
    const [result] = await connection.execute('DELETE FROM artboards WHERE id = ?', [id]);

    await connection.end();

    if (result.affectedRows === 0) {
      return json({ status: 'error', message: 'Artboard not found.' }, { status: 404 });
    }

    return json({
      status: 'success',
      message: 'Artboard deleted successfully.'
    });
  } catch (error) {
    console.error('DELETE API - Error deleting artboard:', error);
    return json({ status: 'error', message: 'Failed to delete artboard.' }, { status: 500 });
  }
}