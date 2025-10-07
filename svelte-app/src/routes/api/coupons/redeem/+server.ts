import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// Redeem a coupon code
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return json({ status: 'error', message: 'Coupon code is required' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get coupon details
      const [couponRows] = await connection.execute(
        `SELECT id, code, type, value, max_uses, used_count, active, expires_at
         FROM coupons
         WHERE code = ?
         FOR UPDATE`,
        [normalizedCode]
      );

      const coupons = couponRows as any[];

      if (coupons.length === 0) {
        await connection.rollback();
        return json({ status: 'error', message: 'Invalid coupon code' }, { status: 404 });
      }

      const coupon = coupons[0];

      // Validate coupon
      if (!coupon.active) {
        await connection.rollback();
        return json({ status: 'error', message: 'This coupon is no longer active' }, { status: 400 });
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        await connection.rollback();
        return json({ status: 'error', message: 'This coupon has expired' }, { status: 400 });
      }

      if (coupon.used_count >= coupon.max_uses) {
        await connection.rollback();
        return json({ status: 'error', message: 'This coupon has reached its usage limit' }, { status: 400 });
      }

      // Check if user has already used this coupon
      const [redemptionRows] = await connection.execute(
        'SELECT id FROM coupon_redemptions WHERE user_id = ? AND coupon_id = ?',
        [locals.user.id, coupon.id]
      );

      if ((redemptionRows as any[]).length > 0) {
        await connection.rollback();
        return json({ status: 'error', message: 'You have already used this coupon' }, { status: 400 });
      }

      // Apply coupon based on type
      if (coupon.type === 'upgrade_pro') {
        // Upgrade user to Pro
        await connection.execute(
          'UPDATE user SET subscription_tier = ? WHERE id = ?',
          ['paid', locals.user.id]
        );
      }
      // Future: Handle other coupon types (discount_percentage, discount_fixed, etc.)

      // Record redemption
      await connection.execute(
        'INSERT INTO coupon_redemptions (coupon_id, user_id) VALUES (?, ?)',
        [coupon.id, locals.user.id]
      );

      // Increment used count
      await connection.execute(
        'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
        [coupon.id]
      );

      await connection.commit();

      return json({
        status: 'success',
        message: 'Coupon applied successfully!',
        coupon_type: coupon.type,
        new_tier: coupon.type === 'upgrade_pro' ? 'paid' : null
      });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error redeeming coupon:', err);
    return json({ status: 'error', message: 'Failed to redeem coupon' }, { status: 500 });
  }
};
