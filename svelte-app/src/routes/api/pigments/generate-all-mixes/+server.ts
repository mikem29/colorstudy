import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

// Helper to generate all combinations
function* getCombinations(arr: any[], size: number) {
  if (size === 1) {
    for (const item of arr) {
      yield [item];
    }
    return;
  }

  for (let i = 0; i <= arr.length - size; i++) {
    for (const combo of getCombinations(arr.slice(i + 1), size - 1)) {
      yield [arr[i], ...combo];
    }
  }
}

// POST - Generate all color mixes
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const { maxPigments = 3, batch = 0, batchSize = 1000 } = await request.json();

    const connection = await pool.getConnection();
    try {
      // Get all pigments (grouped by palette)
      const [pigments] = await connection.execute('SELECT pigment_id, palette_id, r, g, b FROM pigments');
      const pigmentList = pigments as any[];

      if (pigmentList.length === 0) {
        return json({ status: 'error', message: 'No pigments found' });
      }

      // Calculate total combinations
      let totalCombinations = 0;
      for (let numPigments = 2; numPigments <= maxPigments; numPigments++) {
        const combos = [...getCombinations(pigmentList, numPigments)];
        totalCombinations += combos.length * Math.pow(10, numPigments);
      }

      // Generate mixes in batches
      let mixesGenerated = 0;
      let mixesSkipped = 0;
      const startIndex = batch * batchSize;
      const endIndex = startIndex + batchSize;
      let currentIndex = 0;

      await connection.beginTransaction();

      // Generate 2-pigment and 3-pigment mixes
      for (let numPigments = 2; numPigments <= maxPigments; numPigments++) {
        const combinations = [...getCombinations(pigmentList, numPigments)];

        for (const combo of combinations) {
          // Generate all ratio combinations (each pigment can have 1-10 parts)
          const ratios = generateRatios(numPigments);

          for (const ratio of ratios) {
            if (currentIndex >= startIndex && currentIndex < endIndex) {
              // Calculate mixed color using simple averaging (can be enhanced with mixbox later)
              const totalParts = ratio.reduce((sum, r) => sum + r, 0);
              let r = 0, g = 0, b = 0;

              combo.forEach((pigment: any, i: number) => {
                const weight = ratio[i] / totalParts;
                r += pigment.r * weight;
                g += pigment.g * weight;
                b += pigment.b * weight;
              });

              const finalR = Math.round(r);
              const finalG = Math.round(g);
              const finalB = Math.round(b);
              const finalRgb = `${finalR},${finalG},${finalB}`;

              // All pigments in a mix should have the same palette_id
              const paletteId = combo[0].palette_id;

              // Insert the mix with separate RGB columns for faster queries
              const [mixResult] = await connection.execute(
                'INSERT INTO pigment_mixes (palette_id, type, final_rgb, final_r, final_g, final_b, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [paletteId, 'virtual', finalRgb, finalR, finalG, finalB, locals.user.id]
              );

              const mixId = (mixResult as any).insertId;

              // Insert mix details
              for (let i = 0; i < combo.length; i++) {
                const percentage = ((ratio[i] / totalParts) * 100).toFixed(2);
                await connection.execute(
                  'INSERT INTO pigment_mix_details (mix_id, pigment_id, parts, percentage, user_id) VALUES (?, ?, ?, ?, ?)',
                  [mixId, combo[i].pigment_id, ratio[i], percentage, locals.user.id]
                );
              }

              mixesGenerated++;
            } else if (currentIndex >= endIndex) {
              // We've hit the end of this batch
              break;
            }

            currentIndex++;
          }

          if (currentIndex >= endIndex) break;
        }

        if (currentIndex >= endIndex) break;
      }

      await connection.commit();

      const progress = Math.min(100, ((currentIndex / totalCombinations) * 100));
      const isComplete = currentIndex >= totalCombinations;

      return json({
        status: 'success',
        mixesGenerated,
        totalCombinations,
        currentIndex,
        progress: progress.toFixed(2),
        isComplete,
        nextBatch: isComplete ? null : batch + 1
      });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error generating mixes:', err);
    throw error(500, 'Failed to generate mixes');
  }
};

// Generate all ratio combinations for n pigments (each 1-10 parts)
function generateRatios(numPigments: number): number[][] {
  const ratios: number[][] = [];

  function generate(current: number[], depth: number) {
    if (depth === numPigments) {
      ratios.push([...current]);
      return;
    }

    for (let i = 1; i <= 10; i++) {
      current.push(i);
      generate(current, depth + 1);
      current.pop();
    }
  }

  generate([], 0);
  return ratios;
}
