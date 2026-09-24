import { prisma } from '../config/db.js';
import type { AuthUser } from '../types/express.js';
import { NotFoundError } from '../utils/errors.js';
import { getWarehouseId, toNumber } from './movement_common.js';

// Plata acumulada de UNA sede: cuánto entró, cuánto salió y cuánto queda.
// Solo suma (lectura), no mueve stock ni toca nada.

export interface MoneyBySede {
    sede: { id_warehouse: number; warehouse_name: string };
    plataEntradas: number;
    plataSalidas: number;
    resultante: number;
}

export const getMoneyBySede = async (
    user: AuthUser | undefined,
    opts: { warehouse_id?: number } = {},
): Promise<MoneyBySede> => {
    const warehouse_id = getWarehouseId(user, opts.warehouse_id);

    const sede = await prisma.warehouse.findUnique({
        where: { id_warehouse: warehouse_id },
        select: { id_warehouse: true, warehouse_name: true },
    });
    if (!sede) {
        throw new NotFoundError('Sede no encontrada');
    }

    const [entradas, salidas] = await Promise.all([
        prisma.entries.aggregate({
            where: { warehouse_id },
            _sum: { total_value: true },
        }),
        prisma.exits.aggregate({
            where: { warehouse_id },
            _sum: { total_value: true },
        }),
    ]);

    const plataEntradas = toNumber(entradas._sum.total_value ?? 0);
    const plataSalidas = toNumber(salidas._sum.total_value ?? 0);

    return {
        sede,
        plataEntradas,
        plataSalidas,
        resultante: plataEntradas - plataSalidas,
    };
};
