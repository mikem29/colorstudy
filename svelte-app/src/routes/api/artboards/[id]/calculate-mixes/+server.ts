import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// Background calculation function (runs async, not blocking the response)
async function calculateMixesInBackground(artboardId: number, userId: string, paletteId: number) {
  const connection = await pool.getConnection();

  try {
    console.log(`Starting background mix calculation for artboard ${artboardId}`);

    // Get all swatches for this artboard
    const [swatches] = await connection.execute(
      'SELECT id, red, green, blue FROM swatches WHERE artboard_id = ? AND user_id = ?',
      [artboardId, userId]
    );

    const swatchList = swatches as any[];
    let calculated = 0;
    let cached = 0;

    for (const swatch of swatchList) {
      try {
        // Check if already cached
        const [existing] = await connection.execute(
          'SELECT mix_id FROM swatch_color_models WHERE swatch_id = ? AND palette_id = ?',
          [swatch.id, paletteId]
        );

        if ((existing as any[]).length > 0) {
          cached++;
          continue;
        }

        // Calculate closest mix using ACCURATE Euclidean distance
        const [mixRows] = await connection.execute(
          `SELECT
            pm.mix_id,
            SQRT(
              POW(pm.final_r - ?, 2) +
              POW(pm.final_g - ?, 2) +
              POW(pm.final_b - ?, 2)
            ) as distance
          FROM pigment_mixes pm
          WHERE pm.type = 'virtual' AND pm.palette_id = ?
          ORDER BY distance ASC
          LIMIT 1`,
          [swatch.red, swatch.green, swatch.blue, paletteId]
        );

        if ((mixRows as any[]).length > 0) {
          const mixId = (mixRows as any[])[0].mix_id;

          // Cache the result
          await connection.execute(
            'INSERT IGNORE INTO swatch_color_models (swatch_id, palette_id, mix_id) VALUES (?, ?, ?)',
            [swatch.id, paletteId, mixId]
          );
          calculated++;
        }
      } catch (err) {
        console.error(`Error calculating mix for swatch ${swatch.id}:`, err);
        // Continue with next swatch even if one fails
      }
    }

    console.log(`Background calculation complete for artboard ${artboardId}: ${calculated} calculated, ${cached} cached`);

  } catch (err) {
    console.error('Error in background mix calculation:', err);
  } finally {
    connection.release();
  }
}

// POST - Start calculating mixes for all swatches on an artboard
export const POST: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  const artboardId = parseInt(params.id);
  if (!artboardId) {
    return json({ status: 'error', message: 'Invalid artboard ID' }, { status: 400 });
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

    const artboard = (artboards as any[])[0];
    const paletteId = artboard.default_palette_id || 2;

    // Get total swatch count for immediate response
    const [swatches] = await connection.execute(
      'SELECT COUNT(*) as total FROM swatches WHERE artboard_id = ? AND user_id = ?',
      [artboardId, locals.user.id]
    );

    const totalSwatches = (swatches as any[])[0].total;

    // Start background calculation (don't wait for it)
    calculateMixesInBackground(artboardId, locals.user.id, paletteId).catch(err => {
      console.error('Background calculation error:', err);
    });

    // Return immediately
    return json({
      status: 'started',
      message: 'Mix calculation started in background',
      total_swatches: totalSwatches,
      palette_id: paletteId
    });

  } finally {
    connection.release();
  }
};

// GET - Check calculation status
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  const artboardId = parseInt(params.id);
  const connection = await pool.getConnection();

  try {
    const [artboards] = await connection.execute(
      'SELECT default_palette_id FROM artboards WHERE id = ? AND user_id = ?',
      [artboardId, locals.user.id]
    );

    if ((artboards as any[]).length === 0) {
      return json({ status: 'error', message: 'Artboard not found' }, { status: 404 });
    }

    const paletteId = (artboards as any[])[0].default_palette_id || 2;

    // Get total swatches
    const [swatches] = await connection.execute(
      'SELECT COUNT(*) as total FROM swatches WHERE artboard_id = ? AND user_id = ?',
      [artboardId, locals.user.id]
    );

    // Get cached mixes
    const [cached] = await connection.execute(
      `SELECT COUNT(*) as cached
       FROM swatch_color_models scm
       JOIN swatches s ON scm.swatch_id = s.id
       WHERE s.artboard_id = ? AND s.user_id = ? AND scm.palette_id = ?`,
      [artboardId, locals.user.id, paletteId]
    );

    const total = (swatches as any[])[0].total;
    const cachedCount = (cached as any[])[0].cached;

    return json({
      status: 'success',
      total_swatches: total,
      calculated: cachedCount,
      progress: total > 0 ? Math.round((cachedCount / total) * 100) : 0,
      is_complete: cachedCount >= total && total > 0
    });

  } finally {
    connection.release();
  }
};
