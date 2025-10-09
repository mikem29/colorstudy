import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// GET - List all available color palettes
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  const connection = await pool.getConnection();

  try {
    // Get all palettes (public ones + user's own palettes)
    const [rows] = await connection.execute(
      `SELECT
        cp.*,
        COUNT(DISTINCT p.pigment_id) as pigment_count,
        COUNT(DISTINCT pm.mix_id) as mix_count
       FROM color_palettes cp
       LEFT JOIN pigments p ON cp.id = p.palette_id
       LEFT JOIN pigment_mixes pm ON cp.id = pm.palette_id
       WHERE cp.is_public = TRUE OR cp.user_id = ?
       GROUP BY cp.id
       ORDER BY cp.is_public DESC, cp.name ASC`,
      [locals.user.id]
    );

    return json({
      status: 'success',
      data: rows
    });

  } finally {
    connection.release();
  }
};
