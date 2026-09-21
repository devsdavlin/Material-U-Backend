import { type Request, type Response, type NextFunction } from 'express';
import { createEntry, listMyEntries } from '../services/entry_Service.js';

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

// GET /api/entries -> ver las entradas de la sede
export const listMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limite = req.query.limite !== undefined ? Number(req.query.limite) : 50;
    const explicitWarehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
    const entries = await listMyEntries(
      req.user,
      Number.isNaN(limite) ? 50 : limite,
      explicitWarehouseId,
    );
    return res.status(200).json({ ok: true, entries });
  } catch (error) {
    next(error);
  }
};
