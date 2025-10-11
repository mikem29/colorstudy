#!/usr/bin/env node
/**
 * Cron script to process artboard palette mixing queue
 *
 * This script processes queued color mixing requests one swatch at a time.
 * Run this via cron every 1-5 seconds depending on load.
 *
 * Example crontab entry (every 5 seconds):
 * * * * * * cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 * * * * * * sleep 5 && cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 * * * * * * sleep 10 && cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 * * * * * * sleep 15 && cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 * * * * * * sleep 20 && cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 * * * * * * sleep 25 && cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 * * * * * * sleep 30 && cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 * * * * * * sleep 35 && cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 * * * * * * sleep 40 && cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 * * * * * * sleep 45 && cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 * * * * * * sleep 50 && cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 * * * * * * sleep 55 && cd /var/www/huemixy/svelte-app && node scripts/process-mixing-queue.js
 */

import mysql from 'mysql2/promise';

// Database configuration (update with your production settings)
const DB_CONFIG = {
  host: 'localhost',
  port: 3307,
  user: 'story_user',
  password: process.env.DB_PASSWORD || 'your_password_here',
  database: 'huemixy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const BATCH_SIZE = 5; // Process 5 swatches per run
const LOG_PREFIX = '[MixingQueue]';

async function main() {
  const startTime = Date.now();
  const pool = mysql.createPool(DB_CONFIG);

  try {
    console.log(`${LOG_PREFIX} Starting queue processor...`);

    // Get next pending or processing queue entry
    const [queueEntries] = await pool.execute(
      `SELECT * FROM artboard_palette_mixing_queue
       WHERE status IN ('pending', 'processing')
       ORDER BY created_at ASC
       LIMIT 1`
    );

    if ((queueEntries as any[]).length === 0) {
      console.log(`${LOG_PREFIX} No queue entries to process.`);
      await pool.end();
      return;
    }

    const queueEntry = (queueEntries as any[])[0];
    console.log(`${LOG_PREFIX} Processing queue entry #${queueEntry.id} (artboard=${queueEntry.artboard_id}, palette=${queueEntry.palette_id})`);

    // Mark as processing if it was pending
    if (queueEntry.status === 'pending') {
      await pool.execute(
        `UPDATE artboard_palette_mixing_queue
         SET status = 'processing', started_at = NOW()
         WHERE id = ?`,
        [queueEntry.id]
      );
    }

    // Get swatches that need processing (not yet cached)
    const [swatches] = await pool.execute(
      `SELECT s.id, s.red, s.green, s.blue
       FROM swatches s
       WHERE s.artboard_id = ? AND s.user_id = ?
         AND NOT EXISTS (
           SELECT 1 FROM swatch_color_models scm
           WHERE scm.swatch_id = s.id AND scm.palette_id = ?
         )
       LIMIT ?`,
      [queueEntry.artboard_id, queueEntry.user_id, queueEntry.palette_id, BATCH_SIZE]
    );

    const swatchList = swatches as any[];
    console.log(`${LOG_PREFIX} Found ${swatchList.length} swatches to process in this batch`);

    if (swatchList.length === 0) {
      // All swatches processed - mark as completed
      await pool.execute(
        `UPDATE artboard_palette_mixing_queue
         SET status = 'completed', completed_at = NOW()
         WHERE id = ?`,
        [queueEntry.id]
      );
      console.log(`${LOG_PREFIX} Queue entry #${queueEntry.id} completed!`);
      await pool.end();
      return;
    }

    // Process each swatch
    let processed = 0;
    for (const swatch of swatchList) {
      const swatchStartTime = Date.now();

      try {
        // Find closest mix using Euclidean distance
        const [mixRows] = await pool.execute(
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
          [swatch.red, swatch.green, swatch.blue, queueEntry.palette_id]
        );

        if ((mixRows as any[]).length > 0) {
          const mixId = (mixRows as any[])[0].mix_id;
          const distance = (mixRows as any[])[0].distance;

          // Cache the result
          await pool.execute(
            `INSERT IGNORE INTO swatch_color_models (swatch_id, palette_id, mix_id)
             VALUES (?, ?, ?)`,
            [swatch.id, queueEntry.palette_id, mixId]
          );

          processed++;
          const swatchTime = Date.now() - swatchStartTime;
          console.log(`${LOG_PREFIX}   Swatch #${swatch.id}: mix_id=${mixId}, distance=${distance.toFixed(2)}, time=${swatchTime}ms`);
        }
      } catch (err) {
        console.error(`${LOG_PREFIX} Error processing swatch #${swatch.id}:`, err);
        // Continue with next swatch
      }
    }

    // Update progress
    const [progressRows] = await pool.execute(
      `SELECT COUNT(*) as processed FROM swatch_color_models scm
       JOIN swatches s ON scm.swatch_id = s.id
       WHERE s.artboard_id = ? AND s.user_id = ? AND scm.palette_id = ?`,
      [queueEntry.artboard_id, queueEntry.user_id, queueEntry.palette_id]
    );

    const totalProcessed = (progressRows as any[])[0].processed;

    await pool.execute(
      `UPDATE artboard_palette_mixing_queue
       SET swatches_processed = ?
       WHERE id = ?`,
      [totalProcessed, queueEntry.id]
    );

    const elapsedTime = Date.now() - startTime;
    console.log(`${LOG_PREFIX} Batch complete: ${processed}/${BATCH_SIZE} swatches processed in ${elapsedTime}ms (avg ${(elapsedTime / processed).toFixed(1)}ms/swatch)`);
    console.log(`${LOG_PREFIX} Total progress: ${totalProcessed}/${queueEntry.swatches_total}`);

  } catch (error) {
    console.error(`${LOG_PREFIX} Fatal error:`, error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error(`${LOG_PREFIX} Unhandled error:`, error);
  process.exit(1);
});
