import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const message = `${req.method} ${req.originalUrl} ${statusCode} - ${duration}ms`;

    const meta = {
      requestId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id_user,
    };

    if (statusCode >= 500) {
      logger.error(message, meta);
    } else if (statusCode >= 400) {
      logger.warn(message, meta);
    } else {
      logger.info(message, meta);
    }
  });

  next();
};

