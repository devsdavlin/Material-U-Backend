import { Router } from 'express';
import { login } from '../controllers/user_Controller.js';
import { validate_user } from '../middlewares/user_validation.js';
import { loginSchema } from '../Validations/login_schema.js';

export const userRouter = Router();

userRouter.post('/login', validate_user(loginSchema), login);
