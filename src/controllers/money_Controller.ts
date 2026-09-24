import { type Request, type Response, type NextFunction } from 'express';
import { getMoneyBySede } from '../services/money_Service.js';

// GET /api/money/mi-sede -> plata acumulada de mi sede (entró, salió, queda).
// El admin puede pasar ?warehouse_id= para ver una sede puntual.
export const myMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
    const result = await getMoneyBySede(
      req.user,
      warehouseId === undefined ? {} : { warehouse_id: warehouseId },
    );
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};
