import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// GET - List all available color palettes
export const GET: RequestHandler = async ({ locals }) => {
  const connection = await pool.getConnection();

  try {
    // Get all palettes (public ones + user's own palettes if logged in)
    let query;
    let params;

    if (locals.user) {
      // Logged in: show public palettes + user's own palettes
      query = `SELECT
        cp.*,
        COUNT(DISTINCT p.pigment_id) as pigment_count,
        COUNT(DISTINCT pm.mix_id) as mix_count
       FROM color_palettes cp
       LEFT JOIN pigments p ON cp.id = p.palette_id
       LEFT JOIN pigment_mixes pm ON cp.id = pm.palette_id
       WHERE cp.is_public = TRUE OR cp.user_id = ?
       GROUP BY cp.id
       ORDER BY cp.is_public DESC, cp.name ASC`;
      params = [locals.user.id];
    } else {
      // Not logged in: only show public palettes
      query = `SELECT
        cp.*,
        COUNT(DISTINCT p.pigment_id) as pigment_count,
        COUNT(DISTINCT pm.mix_id) as mix_count
       FROM color_palettes cp
       LEFT JOIN pigments p ON cp.id = p.palette_id
       LEFT JOIN pigment_mixes pm ON cp.id = pm.palette_id
       WHERE cp.is_public = TRUE
       GROUP BY cp.id
       ORDER BY cp.name ASC`;
      params = [];
    }

    const [rows] = await connection.execute(query, params);

    // Fetch pigments for each palette
    for (const palette of rows as any[]) {
      const [pigments] = await connection.execute(
        'SELECT pigment_id, name, color_hex, r, g, b, type FROM pigments WHERE palette_id = ? ORDER BY name ASC',
        [palette.id]
      );
      palette.pigments = pigments;
    }

    return json({
      status: 'success',
      data: rows
    });

  } finally {
    connection.release();
  }
};

// POST - Create new color palette
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  const connection = await pool.getConnection();

  try {
    const { name, type, description, is_public } = await request.json();

    // Validate required fields
    if (!name || !type) {
      return json({ status: 'error', message: 'Name and type are required' }, { status: 400 });
    }

    const [result] = await connection.execute(
      `INSERT INTO color_palettes (name, type, description, user_id, is_public)
       VALUES (?, ?, ?, ?, ?)`,
      [name, type, description || null, locals.user.id, is_public || false]
    );

    return json({
      status: 'success',
      message: 'Palette created successfully',
      palette_id: (result as any).insertId
    });

  } finally {
    connection.release();
  }
};
