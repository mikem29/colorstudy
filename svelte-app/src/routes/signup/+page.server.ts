import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { hash } from "@node-rs/argon2";
import { generateId } from "lucia";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (event.locals.user) {
    throw redirect(302, "/dashboard");
  }
  return {};
};

export const actions: Actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const coupon = formData.get("coupon");

    if (
      typeof email !== "string" ||
      email.length < 3 ||
      email.length > 31 ||
      !/\S+@\S+\.\S+/.test(email)
    ) {
      return fail(400, {
        error: "Invalid email address",
        email,
        coupon
      });
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 255) {
      return fail(400, {
        error: "Password must be between 6 and 255 characters",
        email,
        coupon
      });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return fail(400, {
        error: "An account with this email already exists",
        email,
        coupon
      });
    }

    const userId = generateId(15);
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });

    try {
      // Create user
      await createUser(userId, email, passwordHash);

      // Apply coupon if provided
      if (coupon && typeof coupon === "string" && coupon.trim()) {
        const couponResult = await applyCouponToUser(userId, coupon.trim());
        // Coupon application is optional - don't fail signup if it doesn't work
        if (!couponResult.success) {
          console.log('Coupon application failed during signup:', couponResult.error);
        }
      }

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return fail(500, {
        error: "An error occurred while creating your account",
        email,
        coupon
      });
    }

    throw redirect(302, "/dashboard?signup=success");
  }
};

import { getPool } from "$lib/server/db";

const pool = getPool();

async function getUserByEmail(email: string) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM user WHERE email = ?',
      [email]
    );
    const users = rows as any[];
    return users.length > 0 ? users[0] : null;
  } finally {
    connection.release();
  }
}

async function createUser(userId: string, email: string, hashedPassword: string) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      'INSERT INTO user (id, email, hashed_password) VALUES (?, ?, ?)',
      [userId, email, hashedPassword]
    );
  } finally {
    connection.release();
  }
}

async function applyCouponToUser(userId: string, code: string) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const normalizedCode = code.toUpperCase();

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
      return { success: false, error: 'Invalid coupon code' };
    }

    const coupon = coupons[0];

    // Validate coupon
    if (!coupon.active) {
      await connection.rollback();
      return { success: false, error: 'Coupon is not active' };
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      await connection.rollback();
      return { success: false, error: 'Coupon has expired' };
    }

    if (coupon.used_count >= coupon.max_uses) {
      await connection.rollback();
      return { success: false, error: 'Coupon has reached usage limit' };
    }

    // Apply coupon based on type
    if (coupon.type === 'upgrade_pro') {
      await connection.execute(
        'UPDATE user SET subscription_tier = ? WHERE id = ?',
        ['paid', userId]
      );
    }

    // Record redemption
    await connection.execute(
      'INSERT INTO coupon_redemptions (coupon_id, user_id) VALUES (?, ?)',
      [coupon.id, userId]
    );

    // Increment used count
    await connection.execute(
      'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
      [coupon.id]
    );

    await connection.commit();
    return { success: true };

  } catch (err) {
    await connection.rollback();
    console.error('Error applying coupon:', err);
    return { success: false, error: 'Failed to apply coupon' };
  } finally {
    connection.release();
  }
}