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

    // Check if we already have this color model in the cross-reference table
    const [existingModels] = await connection.execute(
      'SELECT * FROM swatch_color_models WHERE swatch_id = ? AND palette_id = ?',
      [swatchId, paletteId]
    );

    let mixId = null;
    let formula = null;

    if ((existingModels as any[]).length > 0) {
      // We have it cached
      mixId = (existingModels as any[])[0].mix_id;
    } else {
      // Generate on-demand by finding closest mix in THIS palette
      const [mixRows] = await connection.execute(
        `SELECT
          pm.mix_id,
          pm.final_rgb,
          SQRT(
            POW(SUBSTRING_INDEX(pm.final_rgb, ',', 1) - ?, 2) +
            POW(SUBSTRING_INDEX(SUBSTRING_INDEX(pm.final_rgb, ',', 2), ',', -1) - ?, 2) +
            POW(SUBSTRING_INDEX(pm.final_rgb, ',', -1) - ?, 2)
          ) as distance
        FROM pigment_mixes pm
        WHERE pm.type = 'virtual' AND pm.palette_id = ?
        ORDER BY distance ASC
        LIMIT 1`,
        [swatch.red, swatch.green, swatch.blue, paletteId]
      );

      if ((mixRows as any[]).length > 0) {
        mixId = (mixRows as any[])[0].mix_id;

        // Save to cross-reference table for future use
        await connection.execute(
          'INSERT INTO swatch_color_models (swatch_id, palette_id, mix_id) VALUES (?, ?, ?)',
          [swatchId, paletteId, mixId]
        );
      }
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
