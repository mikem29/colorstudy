import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// POST - Queue a palette for mixing on this artboard
export const POST: RequestHandler = async ({ params, locals, request }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  const artboardId = parseInt(params.id);
  if (!artboardId) {
    return json({ status: 'error', message: 'Invalid artboard ID' }, { status: 400 });
  }

  const body = await request.json();
  const paletteId = parseInt(body.palette_id);

  if (!paletteId) {
    return json({ status: 'error', message: 'Palette ID required' }, { status: 400 });
  }

  const connection = await pool.getConnection();

  try {
    // Verify artboard ownership
    const [artboards] = await connection.execute(
      'SELECT * FROM artboards WHERE id = ? AND user_id = ?',
      [artboardId, locals.user.id]
    );

    if ((artboards as any[]).length === 0) {
      return json({ status: 'error', message: 'Artboard not found' }, { status: 404 });
    }

    // Verify palette exists
    const [palettes] = await connection.execute(
      'SELECT * FROM color_palettes WHERE id = ?',
      [paletteId]
    );

    if ((palettes as any[]).length === 0) {
      return json({ status: 'error', message: 'Palette not found' }, { status: 404 });
    }

    // Get total swatch count
    const [swatches] = await connection.execute(
      'SELECT COUNT(*) as total FROM swatches WHERE artboard_id = ? AND user_id = ?',
      [artboardId, locals.user.id]
    );

    const totalSwatches = (swatches as any[])[0].total;

    if (totalSwatches === 0) {
      return json({ status: 'error', message: 'No swatches to mix. Add swatches to your artboard first.' }, { status: 400 });
    }

    // Check if palette has mixes available
    const [mixCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM pigment_mixes WHERE palette_id = ? AND type = ?',
      [paletteId, 'virtual']
    );

    const availableMixes = (mixCount as any[])[0].count;
    if (availableMixes === 0) {
      return json({
        status: 'error',
        message: 'This palette has no mix database yet. Please generate mixes for this palette first.'
      }, { status: 400 });
    }

    // Insert or update the queue entry
    await connection.execute(
      `INSERT INTO artboard_palette_mixing_queue
        (artboard_id, palette_id, user_id, status, swatches_total, swatches_processed)
      VALUES (?, ?, ?, 'pending', ?, 0)
      ON DUPLICATE KEY UPDATE
        status = 'pending',
        swatches_total = ?,
        swatches_processed = 0,
        started_at = NULL,
        completed_at = NULL,
        updated_at = CURRENT_TIMESTAMP`,
      [artboardId, paletteId, locals.user.id, totalSwatches, totalSwatches]
    );

    return json({
      status: 'success',
      message: 'Palette queued for mixing',
      artboard_id: artboardId,
      palette_id: paletteId,
      total_swatches: totalSwatches
    });

  } finally {
    connection.release();
  }
};

// GET - Get mixing status for all palettes on this artboard
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  const artboardId = parseInt(params.id);
  const connection = await pool.getConnection();

  try {
    // Verify artboard ownership
    const [artboards] = await connection.execute(
      'SELECT * FROM artboards WHERE id = ? AND user_id = ?',
      [artboardId, locals.user.id]
    );

    if ((artboards as any[]).length === 0) {
      return json({ status: 'error', message: 'Artboard not found' }, { status: 404 });
    }

    // Get all queued/processed palettes for this artboard
    const [queueRows] = await connection.execute(
      `SELECT
        apmq.id,
        apmq.palette_id,
        apmq.status,
        apmq.swatches_total,
        apmq.swatches_processed,
        apmq.started_at,
        apmq.completed_at,
        apmq.created_at,
        cp.name as palette_name,
        cp.type as palette_type
      FROM artboard_palette_mixing_queue apmq
      JOIN color_palettes cp ON apmq.palette_id = cp.id
      WHERE apmq.artboard_id = ? AND apmq.user_id = ?
      ORDER BY apmq.created_at DESC`,
      [artboardId, locals.user.id]
    );

    return json({
      status: 'success',
      data: queueRows
    });

  } finally {
    connection.release();
  }
};
