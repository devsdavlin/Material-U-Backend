import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { userRouter } from './routes/user.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errors_m.js';
import { testDbConnection } from './config/db.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { ok: false, message: 'Demasiados intentos de login, intente en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

testDbConnection().catch(() => { process.exit(1); });

app.get('/health', (_req, res) => { res.json({ ok: true }); });
app.use('/api/users/login', loginLimiter);
app.use('/api/users', userRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => { console.log(`Servidor corriendo en puerto ${PORT}`); });
