import { type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { verifyToken } from '../utils/tokens.js';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Token no proporcionado' });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ ok: false, message: 'Token no proporcionado' });
  }

  let id_user: number;
  try {
    ({ id_user } = verifyToken(token));
  } catch {
    return res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id_user } });
    if (!user || !user.activo) {
      return res.status(401).json({ ok: false, message: 'Usuario no autorizado' });
    }
    req.user = {
      id_user: user.id_user,
      email: user.email,
      rol: user.rol,
      warehouse_id: user.warehouse_id,
    };
    return next();
  } catch (error) {
    console.error('Error en auth:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
};
