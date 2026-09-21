import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { userRouter } from './routes/user.routes.js';
import { materialRouter } from './routes/material.routes.js';
import { entryRouter } from './routes/entry.routes.js';
import { exitRouter } from './routes/exit.routes.js';
import { inventoryRouter } from './routes/inventory.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errors_m.js';

const app = express();

// Seguridad de cabeceras HTTP
app.use(helmet());

// Habilitar CORS para integración con Frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Límite de tamaño en peticiones JSON
app.use(express.json({ limit: '1mb' }));

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

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Rutas de la API
app.use('/api/users/login', loginLimiter);
app.use('/api/users', userRouter);
app.use('/api/materials', materialRouter);
app.use('/api/entries', entryRouter);
app.use('/api/exits', exitRouter);
app.use('/api/inventory', inventoryRouter);

// Manejador 404 para rutas inexistentes
app.use(notFoundHandler);

// Middleware centralizado de captura y respuesta de errores
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
