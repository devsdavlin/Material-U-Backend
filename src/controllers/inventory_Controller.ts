import { type Request, type Response, type NextFunction } from 'express';
import { listMyInventory, type EstadoFiltro } from '../services/inventory_Service.js';

// GET /api/inventory -> ver el saldo de la sede.
// Acepta: ?q=texto &estado=todos|agotado|bajo_minimo|con_stock &limite=100 &warehouse_id=1
export const listMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const rawEstado = typeof req.query.estado === 'string' ? req.query.estado : 'todos';
    const estado: EstadoFiltro =
      rawEstado === 'agotado' || rawEstado === 'bajo_minimo' || rawEstado === 'con_stock'
        ? rawEstado
        : 'todos';
    const limite = req.query.limite !== undefined ? Number(req.query.limite) : 100;
    const warehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;

    const result = await listMyInventory(req.user, {
      q,
      estado,
      limit: Number.isNaN(limite) ? 100 : limite,
      warehouse_id: warehouseId,
    });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};
