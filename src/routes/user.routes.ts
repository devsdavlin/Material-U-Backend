import { Router } from 'express';
import { login, register } from '../controllers/user_Controller.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/Auth_rol.js';
import { validate_body } from '../middlewares/validate_body.js';
import { loginSchema } from '../Validations/login_schema.js';
import { createUserSchema } from '../Validations/createUser_schema.js';

export const userRouter = Router();

// Entrar (público).
userRouter.post('/login', validate_body(loginSchema), login);

// Crear usuario (solo Administrador, con sesión iniciada).
userRouter.post(
  '/',
  auth,
  requireRole('Administrador'),
  validate_body(createUserSchema),
  register,
);
