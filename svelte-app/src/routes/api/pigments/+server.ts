import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// GET - List all pigments
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const connection = await pool.getConnection();
    try {
      const [pigments] = await connection.execute(
        'SELECT * FROM pigments ORDER BY name ASC'
      );

      return json({
        status: 'success',
        data: pigments
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching pigments:', err);
    throw error(500, 'Failed to fetch pigments');
  }
};

// POST - Create new pigment
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const { name, color_hex, r, g, b, type, description } = await request.json();

    // Validate required fields
    if (!name || !color_hex || r === undefined || g === undefined || b === undefined) {
      return json({ status: 'error', message: 'Name, color hex, and RGB values are required' }, { status: 400 });
    }

    // Validate RGB values
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      return json({ status: 'error', message: 'RGB values must be between 0 and 255' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO pigments (name, color_hex, r, g, b, type, description, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          color_hex,
          r,
          g,
          b,
          type || 'Base',
          description || null,
          locals.user.id
        ]
      );

      return json({
        status: 'success',
        message: 'Pigment created successfully',
        pigment_id: (result as any).insertId
      });
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('Error creating pigment:', err);
    throw error(500, 'Failed to create pigment');
  }
};
