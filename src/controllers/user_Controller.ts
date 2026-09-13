import { type Request, type Response } from 'express';
import { loginUser } from '../services/user_Service.js';

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === 'Credenciales inválidas') {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }
    console.error('Error en login:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
};
