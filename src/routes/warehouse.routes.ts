import { Router } from 'express';
import { list, create } from '../controllers/warehouse_Controller.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/Auth_rol.js';
import { validate_body } from '../middlewares/validate_body.js';
import { createWarehouseSchema } from '../Validations/createWarehouse_schema.js';

export const warehouseRouter = Router();

// Todo lo de sedes es solo para el Administrador.
warehouseRouter.use(auth, requireRole('Administrador'));

warehouseRouter.get('/', list);
warehouseRouter.post('/', validate_body(createWarehouseSchema), create);
