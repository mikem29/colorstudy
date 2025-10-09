import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// GET - Get a single pigment
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const pigmentId = parseInt(params.id);

    const connection = await pool.getConnection();
    try {
      const [pigments] = await connection.execute(
        'SELECT * FROM pigments WHERE pigment_id = ?',
        [pigmentId]
      );

      if ((pigments as any[]).length === 0) {
        throw error(404, 'Pigment not found');
      }

      return json({
        status: 'success',
        data: (pigments as any[])[0]
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching pigment:', err);
    throw error(500, 'Failed to fetch pigment');
  }
};

// PUT - Update a pigment
export const PUT: RequestHandler = async ({ params, locals, request }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const pigmentId = parseInt(params.id);
    const { name, color_hex, r, g, b, type, description, palette_id } = await request.json();

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE pigments
         SET name = ?, color_hex = ?, r = ?, g = ?, b = ?, type = ?, description = ?, palette_id = ?
         WHERE pigment_id = ?`,
        [name, color_hex, r, g, b, type, description, palette_id, pigmentId]
      );

      return json({
        status: 'success',
        message: 'Pigment updated successfully'
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error updating pigment:', err);
    throw error(500, 'Failed to update pigment');
  }
};

// DELETE - Delete a pigment
export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const pigmentId = parseInt(params.id);

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'DELETE FROM pigments WHERE pigment_id = ?',
        [pigmentId]
      );

      return json({
        status: 'success',
        message: 'Pigment deleted successfully'
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error deleting pigment:', err);
    throw error(500, 'Failed to delete pigment');
  }
};
