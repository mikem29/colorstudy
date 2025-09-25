import { dev } from '$app/environment';

// Database configuration for huemixy
export const DATABASE_CONFIG = {
  mysql: {
    host: dev ? 'localhost' : process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'story_user',
    password: process.env.MYSQL_PASSWORD || 'story_password',
    database: process.env.MYSQL_DATABASE || (dev ? 'colorstudy' : 'huemixy'),
    connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10')
  }
};