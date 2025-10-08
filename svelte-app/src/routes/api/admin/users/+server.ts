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
