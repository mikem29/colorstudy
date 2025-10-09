import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

async function checkAdminAccess(userId: string): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT email FROM user WHERE id = ?',
      [userId]
    );
    const user = (users as any[])[0];
    return user?.email === 'michael@indiemade.com';
  } finally {
    connection.release();
  }
}

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user || !(await checkAdminAccess(locals.user.id))) {
    throw error(404, 'Not found');
  }

  try {
    const connection = await pool.getConnection();
    try {
      const [artboards] = await connection.execute(`
        SELECT
          a.id,
          a.name,
          a.width_inches,
          a.height_inches,
          a.created_at,
          a.updated_at,
          u.id as user_id,
          u.email as user_email,
          u.subscription_tier,
          (SELECT COUNT(*) FROM images WHERE artboard_id = a.id) as image_count,
          (SELECT COUNT(*) FROM swatches WHERE user_id = u.id AND
           EXISTS (SELECT 1 FROM images WHERE images.id = swatches.image_id AND images.artboard_id = a.id)) as swatch_count
        FROM artboards a
        JOIN user u ON a.user_id = u.id
        ORDER BY a.updated_at DESC
      `);

      return json({
        status: 'success',
        data: artboards
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching artboards:', err);
    throw error(500, 'Failed to fetch artboards');
  }
};
