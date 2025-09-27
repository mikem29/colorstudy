import { json, error } from '@sveltejs/kit';
import { pool } from '$lib/server/auth';
import type { RequestHandler } from './$types';

// Get all artboards for the authenticated user
export const GET: RequestHandler = async ({ locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(`
        SELECT
          a.id,
          a.name,
          a.width_inches,
          a.height_inches,
          a.created_at,
          COUNT(DISTINCT i.id) as image_count,
          COUNT(DISTINCT s.id) as swatch_count
        FROM artboards a
        LEFT JOIN images i ON a.id = i.artboard_id AND i.user_id = ?
        LEFT JOIN swatches s ON a.id = s.artboard_id AND s.user_id = ?
        WHERE a.user_id = ?
        GROUP BY a.id
        ORDER BY a.created_at DESC
      `, [locals.user.id, locals.user.id, locals.user.id]);

      return json({ status: 'success', data: rows });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching artboards:', err);
    return json({ status: 'error', message: 'Failed to fetch artboards.' }, { status: 500 });
  }
};

// Create new artboard
export const POST: RequestHandler = async ({ request, locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const requestData = await request.json();
    const name = requestData.name || 'Untitled Artboard';
    // Use nullish coalescing to only use defaults if values are null/undefined, not just falsy
    const width_inches = requestData.width_inches ?? 8.5;
    const height_inches = requestData.height_inches ?? 11.0;

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        'INSERT INTO artboards (name, width_inches, height_inches, user_id) VALUES (?, ?, ?, ?)',
        [name, width_inches, height_inches, locals.user.id]
      );

      return json({
        status: 'success',
        message: 'Artboard created successfully.',
        artboard_id: (result as any).insertId
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error creating artboard:', err);
    return json({ status: 'error', message: 'Failed to create artboard.' }, { status: 500 });
  }
};