import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

export const POST: RequestHandler = async ({ request, locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const swatchData = await request.json();

    if (!Array.isArray(swatchData)) {
      return json({ status: 'error', message: 'Invalid input data.' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const stmt = `INSERT INTO swatches (hex_color, red, green, blue, cmyk, description, image_id, pos_x, pos_y, sample_x, sample_y, sample_size, line_color, user_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const insertedIds = [];

      for (const swatch of swatchData) {
        if (
          !swatch.hex_color ||
          typeof swatch.red !== 'number' ||
          typeof swatch.green !== 'number' ||
          typeof swatch.blue !== 'number'
        ) {
          await connection.rollback();
          return json({ status: 'error', message: 'Invalid input data in one or more swatches.' }, { status: 400 });
        }

        const [result] = await connection.execute(stmt, [
          swatch.hex_color,
          swatch.red,
          swatch.green,
          swatch.blue,
          swatch.cmyk || '',
          swatch.description || '',
          swatch.image_id || null,
          swatch.pos_x || 0,
          swatch.pos_y || 0,
          swatch.sample_x || 0,
          swatch.sample_y || 0,
          swatch.sample_size || 1,
          swatch.line_color || '#000000',
          locals.user.id // Associate with logged-in user
        ]);

        insertedIds.push((result as any).insertId);
      }

      await connection.commit();

      return json({ status: 'success', message: 'Swatches saved successfully.', inserted_ids: insertedIds });
    } catch (dbError) {
      await connection.rollback();
      console.error('Database error:', dbError);
      return json({ status: 'error', message: 'Database error occurred.' }, { status: 500 });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error saving swatches:', err);
    return json({ status: 'error', message: 'Server error occurred.' }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ locals, url }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const connection = await pool.getConnection();

    try {
      // Only fetch swatches for the logged-in user
      const [rows] = await connection.execute(
        'SELECT * FROM swatches WHERE user_id = ? ORDER BY created_at DESC',
        [locals.user.id]
      );

      return json({ status: 'success', data: rows });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching swatches:', err);
    return json({ status: 'error', message: 'Failed to fetch swatches.' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const deleteData = await request.json();

    if (!deleteData.hex_color || (!deleteData.image_id && deleteData.image_id !== null)) {
      return json({ status: 'error', message: 'Missing required fields for deletion.' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Delete swatch by matching hex_color, image_id, and position (and only for the logged-in user)
      const [result] = await connection.execute(
        'DELETE FROM swatches WHERE hex_color = ? AND image_id = ? AND pos_x = ? AND pos_y = ? AND user_id = ?',
        [
          deleteData.hex_color,
          deleteData.image_id || null,
          deleteData.pos_x || 0,
          deleteData.pos_y || 0,
          locals.user.id
        ]
      );

      if (result.affectedRows > 0) {
        return json({ status: 'success', message: 'Swatch deleted successfully.' });
      } else {
        return json({ status: 'error', message: 'Swatch not found or you do not have permission to delete it.' }, { status: 404 });
      }
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error deleting swatch:', err);
    return json({ status: 'error', message: 'Server error occurred.' }, { status: 500 });
  }
};