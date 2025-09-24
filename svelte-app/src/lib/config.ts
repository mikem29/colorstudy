import { dev } from '$app/environment';

// Database configuration for colorstudy
export const DATABASE_CONFIG = {
  mysql: {
    host: dev ? 'localhost' : process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'rootpassword',
    database: process.env.MYSQL_DATABASE || 'colorstudy',
    connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10')
  }
};