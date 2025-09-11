import pino from 'pino';
import config from '../config/index.js';

export const logger = pino();
logger.level = config.app.logLevel;

export default logger;
