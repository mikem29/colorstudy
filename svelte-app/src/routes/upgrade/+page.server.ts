import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getPool } from "$lib/server/db";

const pool = getPool();

export const load: PageServerLoad = async (event) => {
  if (!event.locals.user) {
    throw redirect(302, "/login");
  }

  // Get user data including subscription tier
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT email, subscription_tier FROM user WHERE id = ?',
      [event.locals.user.id]
    );
    const users = rows as any[];

    // If already Pro, redirect to dashboard
    if (users[0]?.subscription_tier === 'paid') {
      throw redirect(302, "/dashboard");
    }

    return {
      user: users[0]
    };
  } finally {
    connection.release();
  }
};

export const actions: Actions = {
  redeemCoupon: async (event) => {
    if (!event.locals.user) {
      return fail(401, { error: "Unauthorized" });
    }

    const formData = await event.request.formData();
    const couponCode = formData.get("couponCode");

    if (!couponCode || typeof couponCode !== "string") {
      return fail(400, {
        couponError: "Coupon code is required"
      });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const normalizedCode = couponCode.trim().toUpperCase();

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
        return fail(404, {
          couponError: "Invalid coupon code"
        });
      }

      const coupon = coupons[0];

      // Validate coupon
      if (!coupon.active) {
        await connection.rollback();
        return fail(400, {
          couponError: "This coupon is no longer active"
        });
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        await connection.rollback();
        return fail(400, {
          couponError: "This coupon has expired"
        });
      }

      if (coupon.used_count >= coupon.max_uses) {
        await connection.rollback();
        return fail(400, {
          couponError: "This coupon has reached its usage limit"
        });
      }

      // Check if user has already used this coupon
      const [redemptionRows] = await connection.execute(
        'SELECT id FROM coupon_redemptions WHERE user_id = ? AND coupon_id = ?',
        [event.locals.user.id, coupon.id]
      );

      if ((redemptionRows as any[]).length > 0) {
        await connection.rollback();
        return fail(400, {
          couponError: "You have already used this coupon"
        });
      }

      // Apply coupon based on type
      if (coupon.type === 'upgrade_pro') {
        await connection.execute(
          'UPDATE user SET subscription_tier = ? WHERE id = ?',
          ['paid', event.locals.user.id]
        );
      }

      // Record redemption
      await connection.execute(
        'INSERT INTO coupon_redemptions (coupon_id, user_id) VALUES (?, ?)',
        [coupon.id, event.locals.user.id]
      );

      // Increment used count
      await connection.execute(
        'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
        [coupon.id]
      );

      await connection.commit();

      // Redirect to dashboard after successful upgrade
      throw redirect(302, "/dashboard");

    } catch (err) {
      // If it's a redirect, rethrow it
      if (err instanceof Error && err.message.includes('redirect')) {
        throw err;
      }

      await connection.rollback();
      console.error('Error redeeming coupon:', err);
      return fail(500, {
        couponError: "Failed to redeem coupon. Please try again."
      });
    } finally {
      connection.release();
    }
  }
};
