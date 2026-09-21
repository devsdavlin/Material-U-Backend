import { Router } from 'express';
import { create, listMine } from '../controllers/entry_Controller.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/Auth_rol.js';
import { validate_body } from '../middlewares/validate_body.js';
import { entrySchema } from '../Validations/entry_schema.js';

export const entryRouter = Router();

// Solo gente logueada que registra material (almacenista o admin).
entryRouter.use(auth, requireRole('Almacenista', 'Administrador'));

entryRouter.get('/', listMine);
entryRouter.post('/', validate_body(entrySchema), create);
