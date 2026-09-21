import { type Request, type Response, type NextFunction } from 'express';
import { createExit, listMyExits } from '../services/exit_Service.js';

// POST /api/exits -> registra una salida de la sede
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const explicitWarehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
    const result = await createExit(req.body, req.user, explicitWarehouseId);
    return res.status(201).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

// GET /api/exits -> ver las salidas de la sede
export const listMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limite = req.query.limite !== undefined ? Number(req.query.limite) : 50;
    const explicitWarehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
    const exits = await listMyExits(
      req.user,
      Number.isNaN(limite) ? 50 : limite,
      explicitWarehouseId,
    );
    return res.status(200).json({ ok: true, exits });
  } catch (error) {
    next(error);
  }
};
