module.exports = {
  apps: [{
    name: 'huemixy',
    script: 'build/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3006,
      MYSQL_HOST: 'localhost',
      MYSQL_PORT: 3308,
      MYSQL_USER: 'story_user',
      MYSQL_PASSWORD: 'rCy7mRMkZan8H4FpJr8U1/oHwgmHbgqR6yZk17gqS+Y=',
      MYSQL_DATABASE: 'huemixy',
      MYSQL_CONNECTION_LIMIT: 10
    },
    log_file: '/var/www/huemixy/app.log',
    out_file: '/var/www/huemixy/app.log',
    error_file: '/var/www/huemixy/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};