import mysql from 'mysql2/promise';
import { DATABASE_CONFIG } from '$lib/config';

// Create a connection pool for better performance
let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...DATABASE_CONFIG.mysql,
      waitForConnections: true,
      connectionLimit: DATABASE_CONFIG.mysql.connectionLimit || 10,
      queueLimit: 0
    });
  }
  return pool;
}

// For backward compatibility with existing code that uses createConnection
export async function getConnection() {
  return await mysql.createConnection(DATABASE_CONFIG.mysql);
}

// Helper for executing queries
export async function query(sql, params) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    await connection.end();
  }
}

// Helper for transactions
export async function transaction(callback) {
  const connection = await getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}