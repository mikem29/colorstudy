import { json, error } from '@sveltejs/kit';
import { pool } from '$lib/server/auth';
import type { RequestHandler } from './$types';

// Get all palettes grouped by image for the authenticated user
export const GET: RequestHandler = async ({ locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const connection = await pool.getConnection();

    try {
      // Get distinct images with their swatches for the current user only
      const [rows] = await connection.execute(`
        SELECT
          i.id as image_id,
          SUBSTRING_INDEX(i.file_path, '/', -1) as filename,
          SUBSTRING_INDEX(i.file_path, '/', -1) as original_name,
          i.uploaded_at as upload_date,
          COUNT(s.id) as swatch_count,
          SUBSTRING_INDEX(GROUP_CONCAT(s.hex_color ORDER BY s.created_at), ',', 5) as preview_colors
        FROM images i
        LEFT JOIN swatches s ON i.id = s.image_id AND s.user_id = ?
        WHERE i.user_id = ?
        GROUP BY i.id
        ORDER BY i.uploaded_at DESC
      `, [locals.user.id, locals.user.id]);

      return json({ status: 'success', data: rows });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching palettes:', err);
    return json({ status: 'error', message: 'Failed to fetch palettes.' }, { status: 500 });
  }
};

// Create new palette
export const POST: RequestHandler = async ({ request, locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const { filename, artboard_width_inches = 8.5, artboard_height_inches = 11.0 } = await request.json();

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        'INSERT INTO images (file_path, artboard_width_inches, artboard_height_inches, user_id) VALUES (?, ?, ?, ?)',
        [filename, artboard_width_inches, artboard_height_inches, locals.user.id]
      );

      return json({
        status: 'success',
        message: 'Palette created successfully.',
        image_id: (result as any).insertId
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error creating palette:', err);
    return json({ status: 'error', message: 'Failed to create palette.' }, { status: 500 });
  }
};