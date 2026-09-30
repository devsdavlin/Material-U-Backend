import { Router } from 'express';
import { login, register, list, deactivate, reactivate } from '../controllers/user_Controller.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/Auth_rol.js';
import { validate_body } from '../middlewares/validate_body.js';
import { loginSchema } from '../Validations/login_schema.js';
import { createUserSchema } from '../Validations/createUser_schema.js';

export const userRouter = Router();

// Entrar (público).
userRouter.post('/login', validate_body(loginSchema), login);

// Listar usuarios (solo Administrador, con sesión iniciada).
userRouter.get('/', auth, requireRole('Administrador'), list);
// Crear usuario (solo Administrador, con sesión iniciada).
userRouter.post(
  '/',
  auth,
  requireRole('Administrador'),
  validate_body(createUserSchema),
  register,
);

// Apagar / prender acceso (solo Administrador). No borra el historial.
userRouter.patch('/:id/desactivar', auth, requireRole('Administrador'), deactivate);
userRouter.patch('/:id/reactivar', auth, requireRole('Administrador'), reactivate);
