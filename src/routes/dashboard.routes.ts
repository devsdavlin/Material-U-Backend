import { Router } from 'express';
import { myDashboard } from '../controllers/dashboard_Controller.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/Auth_rol.js';

export const dashboardRouter = Router();

// Tablero de mi sede (almacenista o admin).
dashboardRouter.use(auth, requireRole('Almacenista', 'Administrador'));

dashboardRouter.get('/mi-sede', myDashboard);
