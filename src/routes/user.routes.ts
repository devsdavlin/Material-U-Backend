import { Router } from 'express';
import { login } from '../controllers/user_Controller.js';
import { validate_body } from '../middlewares/validate_body.js';
import { loginSchema } from '../Validations/login_schema.js';

export const userRouter = Router();

userRouter.post('/login', validate_body(loginSchema), login);
