import { dev } from '$app/environment';

// Database configuration for huemixy
export const DATABASE_CONFIG = {
  mysql: {
    host: dev ? 'localhost' : process.env.MYSQL_HOST || 'localhost',
    ...(process.env.MYSQL_PORT && { port: parseInt(process.env.MYSQL_PORT) }),
    user: process.env.MYSQL_USER || (dev ? 'm29user' : 'story_user'),
    password: process.env.MYSQL_PASSWORD || (dev ? 'm29Pa55word' : 'story_password'),
    database: process.env.MYSQL_DATABASE || (dev ? 'colorstudy' : 'huemixy'),
    connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10')
  }
};