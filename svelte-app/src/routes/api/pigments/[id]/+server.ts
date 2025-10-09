import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// DELETE - Delete a pigment
export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const pigmentId = parseInt(params.id);

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'DELETE FROM pigments WHERE pigment_id = ?',
        [pigmentId]
      );

      return json({
        status: 'success',
        message: 'Pigment deleted successfully'
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error deleting pigment:', err);
    throw error(500, 'Failed to delete pigment');
  }
};
