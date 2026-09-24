import { Router } from 'express';
import { myMoney } from '../controllers/money_Controller.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/Auth_rol.js';

export const moneyRouter = Router();

// Plata de mi sede (almacenista o admin).
moneyRouter.use(auth, requireRole('Almacenista', 'Administrador'));

moneyRouter.get('/mi-sede', myMoney);
