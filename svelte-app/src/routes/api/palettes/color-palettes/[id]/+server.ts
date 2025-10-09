import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// DELETE - Delete a color palette
export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  const paletteId = parseInt(params.id);
  if (isNaN(paletteId)) {
    throw error(400, 'Invalid palette ID');
  }

  const connection = await pool.getConnection();

  try {
    // Check if palette exists and user has permission
    const [palettes] = await connection.execute(
      'SELECT * FROM color_palettes WHERE id = ?',
      [paletteId]
    );

    if ((palettes as any[]).length === 0) {
      throw error(404, 'Palette not found');
    }

    const palette = (palettes as any[])[0];

    // Only allow deletion if user owns it or it's not public
    if (palette.user_id !== locals.user.id && palette.is_public) {
      throw error(403, 'You do not have permission to delete this palette');
    }

    // Delete the palette (cascade will handle pigments, mixes, etc.)
    await connection.execute(
      'DELETE FROM color_palettes WHERE id = ?',
      [paletteId]
    );

    return json({
      status: 'success',
      message: 'Palette deleted successfully'
    });

  } finally {
    connection.release();
  }
};
