const SENSITIVE_KEYS = new Set(['password', 'password_hash', 'token', 'authorization', 'secret']);

const sanitizeData = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const formatLog = (level: LogLevel, message: string, meta?: unknown) => {
  const timestamp = new Date().toISOString();
  const sanitizedMeta = meta !== undefined ? sanitizeData(meta) : undefined;

  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(sanitizedMeta !== undefined ? { data: sanitizedMeta } : {}),
    });
  }

  const metaString = sanitizedMeta !== undefined ? ` | ${JSON.stringify(sanitizedMeta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaString}`;
};

export const logger = {
  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
      console.debug(formatLog('debug', message, meta));
    }
  },
  info: (message: string, meta?: unknown) => {
    console.info(formatLog('info', message, meta));
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(formatLog('warn', message, meta));
  },
  error: (message: string, meta?: unknown) => {
    console.error(formatLog('error', message, meta));
  },
};

