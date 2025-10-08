import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// GET - List all coupons
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user || locals.user.email !== 'michael@indiemade.com') {
    throw error(404, 'Not found');
  }

  try {
    const connection = await pool.getConnection();
    try {
      const [coupons] = await connection.execute(
        'SELECT * FROM coupons ORDER BY created_at DESC'
      );

      return json({
        status: 'success',
        data: coupons
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching coupons:', err);
    throw error(500, 'Failed to fetch coupons');
  }
};

// POST - Create new coupon
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || locals.user.email !== 'michael@indiemade.com') {
    throw error(404, 'Not found');
  }

  try {
    const { code, type, value, max_uses, active, expires_at } = await request.json();

    // Validate required fields
    if (!code || !type) {
      return json({ status: 'error', message: 'Code and type are required' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO coupons (code, type, value, max_uses, active, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          code,
          type,
          value || null,
          max_uses || 1,
          active ? 1 : 0,
          expires_at || null
        ]
      );

      return json({
        status: 'success',
        message: 'Coupon created successfully'
      });
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('Error creating coupon:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return json({ status: 'error', message: 'Coupon code already exists' }, { status: 400 });
    }
    throw error(500, 'Failed to create coupon');
  }
};
