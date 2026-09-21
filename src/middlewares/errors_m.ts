import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Errores operacionales controlados
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ok: false,
      message: err.message,
    });
  }

  // Error de sintaxis en JSON en el body enviado por el cliente
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    return res.status(400).json({
      ok: false,
      message: 'Formato JSON inválido en el cuerpo de la petición',
    });
  }

  // Errores comunes de Prisma
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaCode = (err as { code: unknown }).code;
    if (prismaCode === 'P2002') {
      return res.status(409).json({
        ok: false,
        message: 'Conflicto: ya existe un registro con estos datos únicos',
      });
    }
    if (prismaCode === 'P2025') {
      return res.status(404).json({
        ok: false,
        message: 'Registro no encontrado en la base de datos',
      });
    }
  }

  // Error genérico no controlado (500)
  console.error('❌ Error no controlado:', err);
  return res.status(500).json({
    ok: false,
    message: 'Error interno del servidor',
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada',
  });
};
