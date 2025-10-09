import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// POST - Save a pigment mix (virtual or analog)
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const { type, finalRgb, pigments } = await request.json();

    // Validate input
    if (!type || !finalRgb || !Array.isArray(pigments) || pigments.length === 0) {
      return json({ status: 'error', message: 'Invalid mix data' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert the mix
      const [mixResult] = await connection.execute(
        `INSERT INTO pigment_mixes (type, final_rgb, user_id)
         VALUES (?, ?, ?)`,
        [type, finalRgb, locals.user.id]
      );

      const mixId = (mixResult as any).insertId;

      // Insert mix details
      for (const pigment of pigments) {
        await connection.execute(
          `INSERT INTO pigment_mix_details (mix_id, pigment_id, parts, percentage, user_id)
           VALUES (?, ?, ?, ?, ?)`,
          [
            mixId,
            pigment.pigment_id,
            pigment.parts,
            pigment.percentage,
            locals.user.id
          ]
        );
      }

      await connection.commit();

      return json({
        status: 'success',
        message: 'Mix saved successfully',
        mix_id: mixId
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error saving mix:', err);
    throw error(500, 'Failed to save mix');
  }
};
