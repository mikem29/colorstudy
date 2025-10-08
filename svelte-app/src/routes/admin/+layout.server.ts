import { error } from '@sveltejs/kit';
import { getPool } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

const pool = getPool();

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw error(404, 'Not found');
  }

  // Fetch email from database using user ID
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT email FROM user WHERE id = ?',
      [locals.user.id]
    );

    const user = (users as any[])[0];
    if (!user || user.email !== 'michael@indiemade.com') {
      throw error(404, 'Not found');
    }
  } finally {
    connection.release();
  }

  return {};
};
