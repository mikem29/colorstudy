import { json, error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import { hash } from '@node-rs/argon2';
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

// PUT - Update user
export const PUT: RequestHandler = async ({ request, locals, params }) => {
  if (!locals.user || !(await checkAdminAccess(locals.user.id))) {
    throw error(404, 'Not found');
  }

  const userId = params.id;

  try {
    const { email, password, subscription_tier } = await request.json();

    const connection = await pool.getConnection();
    try {
      // If password is provided, hash it and update with password
      if (password) {
        const passwordHash = await hash(password, {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1
        });

        await connection.execute(
          'UPDATE user SET email = ?, hashed_password = ?, subscription_tier = ? WHERE id = ?',
          [email, passwordHash, subscription_tier, userId]
        );
      } else {
        // Update without changing password
        await connection.execute(
          'UPDATE user SET email = ?, subscription_tier = ? WHERE id = ?',
          [email, subscription_tier, userId]
        );
      }

      return json({
        status: 'success',
        message: 'User updated successfully'
      });
    } finally {
      connection.release();
    }
  } catch (err: any) {
    console.error('Error updating user:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return json({ status: 'error', message: 'Email already exists' }, { status: 400 });
    }
    throw error(500, 'Failed to update user');
  }
};

// DELETE - Delete user
export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.user || !(await checkAdminAccess(locals.user.id))) {
    throw error(404, 'Not found');
  }

  const userId = params.id;

  try {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM user WHERE id = ?', [userId]);

      return json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    throw error(500, 'Failed to delete user');
  }
};
