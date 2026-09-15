import { type Request, type Response, type NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof Error) {
    if (err.message === 'Credenciales inválidas') {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({ ok: false, message: 'Registro duplicado en la base de datos' });
      }
      if (err.code === 'P2003') {
        return res.status(400).json({ ok: false, message: 'Referencia externa inválida' });
      }
      if (err.code === 'P2025') {
        return res.status(404).json({ ok: false, message: 'Registro no encontrado' });
      }
    }
    console.error('Error:', err);
  }
  return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
}
