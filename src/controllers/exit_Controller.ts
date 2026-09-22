import { type Request, type Response, type NextFunction } from 'express';
import { createExit, listMyExits } from '../services/exit_Service.js';
import { getPaginationParams } from '../utils/pagination.js';

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

// GET /api/exits -> ver las salidas de la sede paginadas (?page=1&limit=20&cost_center=...)
export const listMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paginationParams = getPaginationParams(req.query, 20);
    const explicitWarehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
    const costCenter = typeof req.query.cost_center === 'string' ? req.query.cost_center : undefined;
    
    const result = await listMyExits(
      req.user,
      paginationParams,
      explicitWarehouseId,
      { cost_center: costCenter },
    );
    res.setHeader('X-Total-Count', result.pagination.total.toString());
    return res.status(200).json({
      ok: true,
      exits: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
