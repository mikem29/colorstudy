import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// GET - Get or generate color model for a swatch using a specific palette
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  const swatchId = parseInt(params.id);
  const paletteId = parseInt(params.type); // Now expecting palette_id instead of type

  if (!swatchId || !paletteId) {
    return json({ status: 'error', message: 'Invalid parameters' }, { status: 400 });
  }

  const connection = await pool.getConnection();

  try {
    // First, get the swatch data
    const [swatchRows] = await connection.execute(
      'SELECT * FROM swatches WHERE id = ? AND user_id = ?',
      [swatchId, locals.user.id]
    );

    if ((swatchRows as any[]).length === 0) {
      return json({ status: 'error', message: 'Swatch not found' }, { status: 404 });
    }

    const swatch = (swatchRows as any[])[0];

    // Get palette info
    const [paletteRows] = await connection.execute(
      'SELECT * FROM color_palettes WHERE id = ?',
      [paletteId]
    );

    if ((paletteRows as any[]).length === 0) {
      return json({ status: 'error', message: 'Palette not found' }, { status: 404 });
    }

    const palette = (paletteRows as any[])[0];

    // ONLY read from cache - never calculate on-the-fly
    // User must enable "Calculate Mixes" on artboard for background calculation
    const [existingModels] = await connection.execute(
      'SELECT mix_id FROM swatch_color_models WHERE swatch_id = ? AND palette_id = ?',
      [swatchId, paletteId]
    );

    let mixId = null;
    let formula = null;

    if ((existingModels as any[]).length > 0) {
      mixId = (existingModels as any[])[0].mix_id;
    } else {
      // Not calculated yet - return message to enable calculation
      return json({
        status: 'not_calculated',
        message: 'Enable "Calculate Mixes" on artboard to generate paint formulas',
        swatch_id: swatchId,
        palette_id: paletteId,
        palette_name: palette.name
      });
    }

    // If we have a mix_id, get the formula
    if (mixId) {
      const [details] = await connection.execute(
        `SELECT p.name, pmd.parts, pmd.percentage
         FROM pigment_mix_details pmd
         JOIN pigments p ON pmd.pigment_id = p.pigment_id
         WHERE pmd.mix_id = ?
         ORDER BY pmd.parts DESC`,
        [mixId]
      );

      if ((details as any[]).length > 0) {
        // Round percentages to nearest 10% and ensure they sum to 100%
        const detailsArray = details as any[];
        const rawPercentages = detailsArray.map(d => parseFloat(d.percentage));

        // Round each to nearest 10%
        let roundedPercentages = rawPercentages.map(p => Math.round(p / 10) * 10);

        // Calculate the difference from 100%
        let sum = roundedPercentages.reduce((acc, p) => acc + p, 0);
        let diff = 100 - sum;

        // Adjust the largest percentage(s) to make sum = 100%
        if (diff !== 0) {
          // Find indices sorted by raw percentage (largest first)
          const indices = detailsArray
            .map((_, i) => i)
            .sort((a, b) => rawPercentages[b] - rawPercentages[a]);

          // Distribute the difference by adjusting 10% at a time
          let adjustment = diff > 0 ? 10 : -10;
          let remaining = Math.abs(diff);

          for (let i = 0; i < indices.length && remaining > 0; i++) {
            const idx = indices[i];
            roundedPercentages[idx] += adjustment;
            remaining -= 10;
          }
        }

        // Build formula string
        formula = detailsArray
          .map((d, i) => `${roundedPercentages[i]}% ${d.name}`)
          .join(', ');
      }
    }

    return json({
      status: 'success',
      data: {
        swatch_id: swatchId,
        palette_id: paletteId,
        palette_name: palette.name,
        mix_id: mixId,
        formula: formula || 'No mix data'
      }
    });

  } finally {
    connection.release();
  }
};
