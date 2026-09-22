import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { userRouter } from './routes/user.routes.js';
import { materialRouter } from './routes/material.routes.js';
import { entryRouter } from './routes/entry.routes.js';
import { exitRouter } from './routes/exit.routes.js';
import { inventoryRouter } from './routes/inventory.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errors_m.js';
import { requestLogger } from './middlewares/logger_m.js';
import { logger } from './utils/logger.js';

const app = express();

// Compresión de respuestas HTTP (Gzip / Deflate)
app.use(compression());

// Seguridad de cabeceras HTTP con CSP y protección Cross-Origin
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// Habilitar CORS para integración con Frontend
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Total-Count', 'X-Request-Id'],
    credentials: true,
  }),
);

// Límite de tamaño en peticiones JSON
app.use(express.json({ limit: '1mb' }));

// Middleware de observabilidad y trazabilidad con Request ID
app.use(requestLogger);

// Limitador de tasa contra ataques de fuerza bruta en autenticación
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10, // Máximo 10 intentos por IP en esa ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiados intentos fallidos. Intente nuevamente en 15 minutos.',
  },
});

// Limitador de tasa para operaciones de movimiento (entradas y salidas)
const movementLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  limit: 120, // Máximo 120 movimientos por minuto por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiadas operaciones de inventario en corto tiempo. Intente nuevamente en un momento.',
  },
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Rutas de la API
app.use('/api/users/login', loginLimiter);
app.use('/api/users', userRouter);
app.use('/api/materials', materialRouter);
app.use('/api/entries', movementLimiter, entryRouter);
app.use('/api/exits', movementLimiter, exitRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/dashboard', dashboardRouter);

// Manejador 404 para rutas inexistentes
app.use(notFoundHandler);

// Middleware centralizado de captura y respuesta de errores
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor escuchando en el puerto ${PORT}`);
});
