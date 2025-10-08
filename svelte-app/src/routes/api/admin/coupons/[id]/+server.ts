import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// PUT - Update coupon
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  if (!locals.user || locals.user.email !== 'michael@indiemade.com') {
    throw error(404, 'Not found');
  }

  const couponId = params.id;

  try {
    const { code, type, value, max_uses, active, expires_at } = await request.json();

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE coupons
         SET code = ?, type = ?, value = ?, max_uses = ?, active = ?, expires_at = ?
         WHERE id = ?`,
        [
          code,
          type,
          value || null,
          max_uses,
          active ? 1 : 0,
          expires_at || null,
          couponId
        ]
      );

      return json({
        status: 'success',
        message: 'Coupon updated successfully'
      });
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('Error updating coupon:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return json({ status: 'error', message: 'Coupon code already exists' }, { status: 400 });
    }
    throw error(500, 'Failed to update coupon');
  }
};

// DELETE - Delete coupon
export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.user || locals.user.email !== 'michael@indiemade.com') {
    throw error(404, 'Not found');
  }

  const couponId = params.id;

  try {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM coupons WHERE id = ?', [couponId]);

      return json({
        status: 'success',
        message: 'Coupon deleted successfully'
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error deleting coupon:', err);
    throw error(500, 'Failed to delete coupon');
  }
};
