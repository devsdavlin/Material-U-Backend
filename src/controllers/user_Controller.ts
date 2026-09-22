import { type Request, type Response, type NextFunction } from 'express';
import { loginUser, createUser } from '../services/user_Service.js';

// POST /api/users/login -> entrar (público, con límite de intentos).
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

// POST /api/users -> crear usuario (solo Administrador).
// El Almacenista siempre necesita warehouse_id; el Administrador no.
// No devuelve token: el usuario nuevo entra con su propio login.
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = await createUser(req.body);
    return res.status(201).json({ ok: true, user });
  } catch (error) {
    next(error);
  }
};
