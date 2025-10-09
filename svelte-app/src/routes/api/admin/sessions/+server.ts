import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { RequestHandler } from './$types';

const pool = getPool();

async function checkAdminAccess(userId: string): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT email FROM user WHERE id = ?',
      [userId]
    );
    const user = (users as any[])[0];
    return user?.email === 'michael@indiemade.com';
  } finally {
    connection.release();
  }
}

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user || !(await checkAdminAccess(locals.user.id))) {
    throw error(404, 'Not found');
  }

  try {
    const connection = await pool.getConnection();
    try {
      const currentTime = Math.floor(Date.now() / 1000);

      // Get all active sessions (not expired)
      const [sessions] = await connection.execute(`
        SELECT
          s.id as session_id,
          s.user_id,
          s.expires_at,
          u.email,
          u.subscription_tier,
          u.created_at as user_created_at
        FROM session s
        JOIN user u ON s.user_id = u.id
        WHERE s.expires_at > ?
        ORDER BY s.expires_at DESC
      `, [currentTime]);

      // Process sessions to add helpful info
      const processedSessions = (sessions as any[]).map(session => ({
        session_id: session.session_id,
        user_id: session.user_id,
        email: session.email,
        subscription_tier: session.subscription_tier,
        expires_at: session.expires_at,
        expires_at_date: new Date(session.expires_at * 1000).toISOString(),
        created_at: Math.floor(session.expires_at - (30 * 24 * 60 * 60)), // Session typically lasts 30 days
        is_active: session.expires_at > currentTime,
        time_until_expiry: session.expires_at - currentTime
      }));

      // Get unique active users count
      const uniqueUsers = new Set(processedSessions.map(s => s.user_id));

      return json({
        status: 'success',
        data: {
          sessions: processedSessions,
          total_sessions: processedSessions.length,
          active_users: uniqueUsers.size
        }
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error fetching sessions:', err);
    throw error(500, 'Failed to fetch sessions');
  }
};
