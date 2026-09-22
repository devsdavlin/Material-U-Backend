import { Router } from 'express';
import { listMine, detail, setMinimo } from '../controllers/inventory_Controller.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/Auth_rol.js';

export const inventoryRouter = Router();

// Ver el saldo de mi sede (almacenista o admin).
inventoryRouter.use(auth, requireRole('Almacenista', 'Administrador'));

inventoryRouter.get('/', listMine);
inventoryRouter.get('/:materialId', detail);
inventoryRouter.patch('/:materialId/minimo', setMinimo);
