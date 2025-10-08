import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user || locals.user.email !== 'michael@indiemade.com') {
    throw error(404, 'Not found');
  }

  try {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        'SELECT id, email, subscription_tier, created_at FROM user ORDER BY created_at DESC'
      );

      return json({
        status: 'success',
        data: users
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching users:', err);
    throw error(500, 'Failed to fetch users');
  }
};
