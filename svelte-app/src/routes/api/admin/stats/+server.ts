import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const connection = await pool.getConnection();
    try {
      // Get total users
      const [userResult] = await connection.execute('SELECT COUNT(*) as count FROM user');
      const totalUsers = (userResult as any[])[0].count;

      // Get total coupons
      const [couponResult] = await connection.execute('SELECT COUNT(*) as count FROM coupons');
      const totalCoupons = (couponResult as any[])[0].count;

      // Get active coupons
      const [activeCouponResult] = await connection.execute(
        'SELECT COUNT(*) as count FROM coupons WHERE active = 1'
      );
      const activeCoupons = (activeCouponResult as any[])[0].count;

      return json({
        status: 'success',
        data: {
          totalUsers,
          totalCoupons,
          activeCoupons
        }
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
    throw error(500, 'Failed to fetch stats');
  }
};
