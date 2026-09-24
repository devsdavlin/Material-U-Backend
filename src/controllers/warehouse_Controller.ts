import { type Request, type Response, type NextFunction } from 'express';
import { createWarehouse, find_warehouse } from '../services/warehouse_service.js';

// GET /api/warehouses -> lista de sedes para el desplegable (solo activas las usa el front).
export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sedes = await find_warehouse();
    return res.status(200).json({ ok: true, sedes });
  } catch (error) {
    next(error);
  }
};

// POST /api/warehouses -> crear una sede nueva.
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sede = await createWarehouse(req.body);
    return res.status(201).json({ ok: true, sede });
  } catch (error) {
    next(error);
  }
};
