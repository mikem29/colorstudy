import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// GET - Find closest pigment mix for given RGB values
export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const r = parseInt(url.searchParams.get('r') || '0');
    const g = parseInt(url.searchParams.get('g') || '0');
    const b = parseInt(url.searchParams.get('b') || '0');

    // Validate RGB values
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      return json({ status: 'error', message: 'Invalid RGB values' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      // Use a bounding box to limit the search space (±50 for each RGB component)
      const searchRadius = 50;
      const minR = Math.max(0, r - searchRadius);
      const maxR = Math.min(255, r + searchRadius);
      const minG = Math.max(0, g - searchRadius);
      const maxG = Math.min(255, g + searchRadius);
      const minB = Math.max(0, b - searchRadius);
      const maxB = Math.min(255, b + searchRadius);

      // Find closest mix using Euclidean distance in RGB space
      // First try within the bounding box for speed
      let [rows] = await connection.execute(
        `SELECT
          pm.mix_id,
          pm.final_rgb,
          pm.final_r,
          pm.final_g,
          pm.final_b,
          SQRT(
            POW(pm.final_r - ?, 2) +
            POW(pm.final_g - ?, 2) +
            POW(pm.final_b - ?, 2)
          ) as distance
        FROM pigment_mixes pm
        WHERE pm.type = 'virtual'
          AND pm.final_r BETWEEN ? AND ?
          AND pm.final_g BETWEEN ? AND ?
          AND pm.final_b BETWEEN ? AND ?
        ORDER BY distance ASC
        LIMIT 1`,
        [r, g, b, minR, maxR, minG, maxG, minB, maxB]
      );

      // If no match found in bounding box, expand search (but still use some limits)
      if ((rows as any[]).length === 0) {
        [rows] = await connection.execute(
          `SELECT
            pm.mix_id,
            pm.final_rgb,
            pm.final_r,
            pm.final_g,
            pm.final_b,
            SQRT(
              POW(pm.final_r - ?, 2) +
              POW(pm.final_g - ?, 2) +
              POW(pm.final_b - ?, 2)
            ) as distance
          FROM pigment_mixes pm
          WHERE pm.type = 'virtual'
          ORDER BY distance ASC
          LIMIT 1`,
          [r, g, b]
        );
      }

      if ((rows as any[]).length === 0) {
        return json({
          status: 'success',
          data: null,
          message: 'No mixes found. Generate the mix database first.'
        });
      }

      const closestMix = (rows as any[])[0];

      // Get the pigment details for this mix
      const [details] = await connection.execute(
        `SELECT
          p.name,
          pmd.parts,
          pmd.percentage
        FROM pigment_mix_details pmd
        JOIN pigments p ON pmd.pigment_id = p.pigment_id
        WHERE pmd.mix_id = ?
        ORDER BY pmd.parts DESC`,
        [closestMix.mix_id]
      );

      // Format as mixing formula
      const formula = (details as any[])
        .map(d => `${d.parts} ${d.parts === 1 ? 'part' : 'parts'} ${d.name}`)
        .join(' + ');

      const shortFormula = (details as any[])
        .map(d => `${d.name} (${Math.round(d.percentage)}%)`)
        .join(' + ');

      return json({
        status: 'success',
        data: {
          mix_id: closestMix.mix_id,
          final_rgb: closestMix.final_rgb,
          distance: parseFloat(closestMix.distance).toFixed(2),
          formula,
          shortFormula,
          pigments: details
        }
      });

    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error finding mix:', err);
    throw error(500, 'Failed to find mix');
  }
};
