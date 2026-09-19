import { type Request, type Response, type NextFunction } from 'express';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: 'Usuario no autenticado' });
    }
    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ ok: false, message: 'No tienes permiso para esta acción' });
    }
    return next();
  };
};
