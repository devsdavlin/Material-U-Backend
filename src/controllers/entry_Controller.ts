import { type Request, type Response, type NextFunction } from 'express';
import { createEntry, listMyEntries } from '../services/entry_Service.js';
import { getPaginationParams } from '../utils/pagination.js';

// POST /api/entries -> registra una entrada en la sede
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const explicitWarehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
    const result = await createEntry(req.body, req.user, explicitWarehouseId);
    return res.status(201).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

// GET /api/entries -> ver las entradas de la sede paginadas (?page=1&limit=20)
export const listMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paginationParams = getPaginationParams(req.query, 20);
    const explicitWarehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
    const result = await listMyEntries(
      req.user,
      paginationParams,
      explicitWarehouseId,
    );
    res.setHeader('X-Total-Count', result.pagination.total.toString());
    return res.status(200).json({
      ok: true,
      entries: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
