import { prisma } from '../config/db.js';
import type { AuthUser } from '../types/express.js';
import { NotFoundError } from '../utils/errors.js';
import { getWarehouseId, toNumber } from './movement_common.js';

// Plata acumulada de UNA sede: cuánto entró, cuánto salió y cuánto queda.
// Ejecuta las consultas en paralelo para reducir round-trips a la BD.

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

    // Ejecución paralela de sede y agregaciones en un solo roundtrip
    const [sede, entradas, salidas] = await Promise.all([
        prisma.warehouse.findUnique({
            where: { id_warehouse: warehouse_id },
            select: { id_warehouse: true, warehouse_name: true },
        }),
        prisma.entries.aggregate({
            where: { warehouse_id },
            _sum: { total_value: true },
        }),
        prisma.exits.aggregate({
            where: { warehouse_id },
            _sum: { total_value: true },
        }),
    ]);

    if (!sede) {
        throw new NotFoundError('Sede no encontrada');
    }

    const plataEntradas = toNumber(entradas._sum.total_value ?? 0);
    const plataSalidas = toNumber(salidas._sum.total_value ?? 0);

    return {
        sede,
        plataEntradas,
        plataSalidas,
        resultante: plataEntradas - plataSalidas,
    };
};
