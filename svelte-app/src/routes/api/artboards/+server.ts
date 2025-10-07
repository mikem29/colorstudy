import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from './$types';

const pool = getPool();

// Get all artboards for the authenticated user
export const GET: RequestHandler = async ({ locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    logger.info({ userId: locals.user.id }, 'Fetching artboards for user');
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(`
        SELECT
          a.id,
          a.name,
          a.width_inches,
          a.height_inches,
          a.created_at,
          COUNT(DISTINCT i.id) as image_count,
          COUNT(DISTINCT s.id) as swatch_count,
          (
            SELECT i2.file_path
            FROM images i2
            WHERE i2.artboard_id = a.id
            ORDER BY i2.id ASC
            LIMIT 1
          ) as first_image_path
        FROM artboards a
        LEFT JOIN images i ON a.id = i.artboard_id AND i.user_id = ?
        LEFT JOIN swatches s ON a.id = s.artboard_id AND s.user_id = ?
        WHERE a.user_id = ?
        GROUP BY a.id, a.name, a.width_inches, a.height_inches, a.created_at
        ORDER BY a.created_at DESC
      `, [locals.user.id, locals.user.id, locals.user.id]);

      // Get user's subscription tier
      const [userRows] = await connection.execute(
        'SELECT subscription_tier FROM user WHERE id = ?',
        [locals.user.id]
      );
      const user = (userRows as any[])[0];

      // Process rows to add thumbnail paths
      const processedRows = (rows as any[]).map(row => {
        let thumbnail_path = null;
        if (row.first_image_path) {
          // Convert "uploads/filename.jpg" to "uploads/thumbs/filename.jpg"
          const pathParts = row.first_image_path.split('/');
          if (pathParts.length === 2 && pathParts[0] === 'uploads') {
            thumbnail_path = `uploads/thumbs/${pathParts[1]}`;
          }
        }
        return {
          ...row,
          thumbnail_path
        };
      });
      return json({
        status: 'success',
        data: processedRows,
        subscription_tier: user.subscription_tier
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error({ err, stack: (err as Error).stack }, 'Error fetching artboards');
    return json({ status: 'error', message: 'Failed to fetch artboards.' }, { status: 500 });
  }
};

// Create new artboard
export const POST: RequestHandler = async ({ request, locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    throw error(401, 'Authentication required');
  }

  try {
    const requestData = await request.json();

    const name = requestData.name || 'Untitled Artboard';
    // Use nullish coalescing to only use defaults if values are null/undefined, not just falsy
    const width_inches = requestData.width_inches ?? 8.5;
    const height_inches = requestData.height_inches ?? 11.0;

    const connection = await pool.getConnection();

    try {
      // Check user's subscription tier and artboard count
      const [userRows] = await connection.execute(
        'SELECT subscription_tier FROM user WHERE id = ?',
        [locals.user.id]
      );
      const user = (userRows as any[])[0];

      if (user.subscription_tier === 'free') {
        // Count existing artboards
        const [countRows] = await connection.execute(
          'SELECT COUNT(*) as count FROM artboards WHERE user_id = ?',
          [locals.user.id]
        );
        const artboardCount = (countRows as any[])[0].count;

        if (artboardCount >= 5) {
          return json({
            status: 'error',
            message: 'Free tier limited to 5 artboards. Upgrade to create more.',
            limit_reached: true
          }, { status: 403 });
        }
      }

      const [result] = await connection.execute(
        'INSERT INTO artboards (name, width_inches, height_inches, user_id) VALUES (?, ?, ?, ?)',
        [name, width_inches, height_inches, locals.user.id]
      );

      return json({
        status: 'success',
        message: 'Artboard created successfully.',
        artboard_id: (result as any).insertId
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error creating artboard:', err);
    return json({ status: 'error', message: 'Failed to create artboard.' }, { status: 500 });
  }
};