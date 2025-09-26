// Database configuration for huemixy
export const DATABASE_CONFIG = {
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    ...(process.env.MYSQL_PORT && { port: parseInt(process.env.MYSQL_PORT) }),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10')
  }
};