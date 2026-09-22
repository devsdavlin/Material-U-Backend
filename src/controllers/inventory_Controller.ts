import { type Request, type Response, type NextFunction } from 'express';
import {
  listMyInventory,
  getMaterialDetail,
  setMinStock,
  type EstadoFiltro,
} from '../services/inventory_Service.js';
import { updateMinStockSchema } from '../Validations/inventory_schema.js';
import { validate_body } from '../middlewares/validate_body.js';

const parseMaterialId = (value: unknown): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

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

// GET /api/inventory/:materialId -> saldo + últimos movimientos de un producto en mi sede.
export const detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const materialId = parseMaterialId(req.params.materialId);
    if (materialId === null) {
      return res.status(400).json({ ok: false, message: 'ID de material inválido' });
    }
    const warehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
    const result = await getMaterialDetail(req.user, materialId, { warehouse_id: warehouseId });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/inventory/:materialId/minimo -> fija el stock mínimo en mi sede.
export const setMinimo = [
  validate_body(updateMinStockSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const materialId = parseMaterialId(req.params.materialId);
      if (materialId === null) {
        return res.status(400).json({ ok: false, message: 'ID de material inválido' });
      }
      const result = await setMinStock(req.user, materialId, req.body.min_stock);
      return res.status(200).json({ ok: true, ...result });
    } catch (error) {
      next(error);
    }
  },
];
