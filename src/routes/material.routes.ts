import { Router } from 'express';
import { create, update, search, deactivate, reactivate } from '../controllers/material_Controller.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/Auth_rol.js';
import { validate_body } from '../middlewares/validate_body.js';
import { createMaterialSchema, updateMaterialSchema } from '../Validations/materials_schema.js';

export const materialRouter = Router();

materialRouter.use(auth, requireRole('Almacenista'));

materialRouter.get('/buscar', search);
materialRouter.post('/', validate_body(createMaterialSchema), create);
materialRouter.patch('/:id', validate_body(updateMaterialSchema), update);
materialRouter.patch('/:id/desactivar', deactivate);
materialRouter.patch('/:id/reactivar', reactivate);
