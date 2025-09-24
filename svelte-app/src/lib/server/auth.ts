import { Lucia } from "lucia";
import mysql from 'mysql2/promise';
import { dev } from "$app/environment";
import { DATABASE_CONFIG } from '../config.js';

// MySQL connection pool
const pool = mysql.createPool({
  host: DATABASE_CONFIG.mysql.host,
  port: DATABASE_CONFIG.mysql.port,
  user: DATABASE_CONFIG.mysql.user,
  password: DATABASE_CONFIG.mysql.password,
  database: DATABASE_CONFIG.mysql.database,
  connectionLimit: DATABASE_CONFIG.mysql.connectionLimit,
});

// Custom MySQL adapter for Lucia
class MySQLAdapter {
  private pool: mysql.Pool;

  constructor(pool: mysql.Pool) {
    this.pool = pool;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.execute('DELETE FROM session WHERE id = ?', [sessionId]);
    } finally {
      connection.release();
    }
  }

  async deleteUserSessions(userId: string): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.execute('DELETE FROM session WHERE user_id = ?', [userId]);
    } finally {
      connection.release();
    }
  }

  async getSessionAndUser(sessionId: string): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const connection = await this.pool.getConnection();
    try {
      const [sessionRows] = await connection.execute(
        'SELECT * FROM session WHERE id = ?',
        [sessionId]
      );
      const sessions = sessionRows as any[];

      if (sessions.length === 0) {
        return [null, null];
      }

      const rawSession = sessions[0];

      // Convert Unix timestamp back to Date object for Lucia
      const expiresAtDate = new Date(rawSession.expires_at * 1000);

      // Lucia expects camelCase property names
      const session: any = {
        id: rawSession.id,
        expiresAt: expiresAtDate,
        userId: rawSession.user_id
      };

      const [userRows] = await connection.execute(
        'SELECT * FROM user WHERE id = ?',
        [session.userId]
      );
      const users = userRows as DatabaseUser[];

      if (users.length === 0) {
        return [session, null];
      }

      // Return user with proper structure for Lucia
      return [session, {
        id: users[0].id,
        email: users[0].email
      }];
    } finally {
      connection.release();
    }
  }

  async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM session WHERE user_id = ?',
        [userId]
      );
      const rawSessions = rows as any[];

      // Convert Unix timestamps back to Date objects for Lucia (camelCase properties)
      return rawSessions.map(rawSession => ({
        id: rawSession.id,
        expiresAt: new Date(rawSession.expires_at * 1000), // Convert Unix timestamp to Date
        userId: rawSession.user_id
      }));
    } finally {
      connection.release();
    }
  }

  async setSession(session: any): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      // Lucia passes sessions with different property names than our DatabaseSession interface
      const sessionData = session as any;

      // Try different property name variations that Lucia might use
      const userId = sessionData.userId || sessionData.user_id;
      const expiresAt = sessionData.expiresAt || sessionData.expires_at;

      // Convert expiresAt to Unix timestamp in seconds
      let expiresAtTimestamp: number;
      if (typeof expiresAt === 'number') {
        // Already a timestamp
        expiresAtTimestamp = expiresAt;
      } else if (expiresAt && typeof expiresAt.getTime === 'function') {
        // Date object
        expiresAtTimestamp = Math.floor(expiresAt.getTime() / 1000);
      } else {
        // Fallback: 24 hours from now
        expiresAtTimestamp = Math.floor(Date.now() / 1000) + 86400;
        console.warn('Using fallback expiration time for session:', session.id);
      }

      // Ensure none of the values are undefined
      if (!session.id || !userId || !expiresAtTimestamp) {
        console.error('Session validation failed:', {
          id: session.id,
          userId,
          expiresAtTimestamp,
          originalSession: sessionData
        });
        throw new Error(`Invalid session data: id=${session.id}, user_id=${userId}, expires_at=${expiresAtTimestamp}`);
      }

      await connection.execute(
        'INSERT INTO session (id, expires_at, user_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)',
        [session.id, expiresAtTimestamp, userId]
      );
    } finally {
      connection.release();
    }
  }

  async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.execute(
        'UPDATE session SET expires_at = ? WHERE id = ?',
        [Math.floor(expiresAt.getTime() / 1000), sessionId]
      );
    } finally {
      connection.release();
    }
  }

  async deleteExpiredSessions(): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.execute(
        'DELETE FROM session WHERE expires_at <= ?',
        [Math.floor(Date.now() / 1000)]
      );
    } finally {
      connection.release();
    }
  }
}

interface DatabaseSession {
  id: string;
  expires_at: Date;
  user_id: string;
}

interface DatabaseUser {
  id: string;
  email: string;
  hashed_password: string;
}

// Create the adapter
const adapter = new MySQLAdapter(pool);

// Initialize Lucia
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev
    }
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes?.email || ''
    };
  }
});

// Export the pool for direct queries if needed
export { pool };

// Type declarations for Lucia
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  email: string;
}