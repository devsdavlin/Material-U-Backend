import { Router } from 'express';
import { create, listMine } from '../controllers/exit_Controller.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/Auth_rol.js';
import { validate_body } from '../middlewares/validate_body.js';
import { exitSchema } from '../Validations/exit_schema.js';

export const exitRouter = Router();

// Solo gente logueada que mueve material (almacenista o admin).
exitRouter.use(auth, requireRole('Almacenista', 'Administrador'));

exitRouter.get('/', listMine);
exitRouter.post('/', validate_body(exitSchema), create);
