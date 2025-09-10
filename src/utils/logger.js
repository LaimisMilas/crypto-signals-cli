import pino from 'pino';
export const logger = pino({ level: process.env.APP_LOG_LEVEL || 'info' });
export default logger;
