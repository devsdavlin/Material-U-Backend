import { type Request, type Response, type NextFunction } from 'express';
import { getMyDashboard } from '../services/dashboard_Service.js';

// GET /api/dashboard/mi-sede -> tablero de mi sede en una sola llamada.
// El admin puede pasar ?warehouse_id= para ver una sede puntual.
export const myDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouseId = req.query.warehouse_id ? Number(req.query.warehouse_id) : undefined;
    const result = await getMyDashboard(req.user, { warehouse_id: warehouseId });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};
