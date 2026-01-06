import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[${req.method}] ${req.url} - ${status} ${message}`, {
    error: err,
    stack: err.stack,
  });

  return res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req, res, next) => {
  logger.warn(`Route not found: [${req.method}] ${req.url}`);

  return res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.url}`,
  });
};

export default {
  errorHandler,
  notFound,
};