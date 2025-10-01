import pino from 'pino';
import { dev } from '$app/environment';

export const logger = pino({
  level: dev ? 'debug' : 'info',
  transport: dev ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname'
    }
  } : undefined
});
