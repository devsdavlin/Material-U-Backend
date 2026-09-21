import { type Request, type Response, type NextFunction } from 'express';
import { loginUser } from '../services/user_Service.js';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};
