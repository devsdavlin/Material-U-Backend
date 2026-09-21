import { prisma } from '../config/db.js';
import type { AuthUser } from '../types/express.js';
import { getWarehouseId, toNumber } from './movement_common.js';

// Muestra el INVENTARIO de la sede: cada producto con su saldo.
// Estado: agotado (0 o menos), bajo mínimo (por debajo del mínimo), ok.

export type EstadoFiltro = 'todos' | 'agotado' | 'bajo_minimo' | 'con_stock';

const calcEstado = (stock: number, minStock: number): 'agotado' | 'bajo_minimo' | 'ok' => {
    if (stock <= 0) return 'agotado';
    if (stock < minStock) return 'bajo_minimo';
    return 'ok';
};

export const listMyInventory = async (
    user: AuthUser | undefined,
    opts: { q?: string; estado?: EstadoFiltro; limit?: number; warehouse_id?: number | undefined } = {},
) => {
    const warehouse_id = getWarehouseId(user, opts.warehouse_id);
    const take = Math.min(Math.max(opts.limit ?? 100, 1), 200);
    const q = (opts.q ?? '').trim();

    // Consultamos los registros de la sede
    const allRows = await prisma.inventory.findMany({
        where: {
            warehouse_id,
            ...(q
                ? {
                        materials: {
                            OR: [
                                { material_name: { contains: q, mode: 'insensitive' } },
                                { internal_code: { contains: q, mode: 'insensitive' } },
                            ],
                        },
                    }
                : {}),
        },
        include: {
            materials: {
                select: {
                    id_material: true,
                    material_name: true,
                    internal_code: true,
                    unit: true,
                    category: true,
                    activo: true,
                },
            },
        },
        orderBy: { materials: { material_name: 'asc' } },
    });

    // Mapeamos los datos con cálculo de estado
    const mapped = allRows.map((r) => {
        const stock = toNumber(r.current_stock);
        const min = toNumber(r.min_stock);
        return {
            id_inventory: r.id_inventory,
            material_id: r.material_id,
            material_name: r.materials.material_name,
            internal_code: r.materials.internal_code,
            unit: r.materials.unit,
            category: r.materials.category,
            activo: r.materials.activo,
            current_stock: stock,
            min_stock: min,
            estado: calcEstado(stock, min),
        };
    });

    // El resumen (KPIs) refleja el estado global de la sede
    const resumen = {
        total: mapped.length,
        con_stock: mapped.filter((r) => r.estado === 'ok').length,
        agotados: mapped.filter((r) => r.estado === 'agotado').length,
        bajo_minimo: mapped.filter((r) => r.estado === 'bajo_minimo').length,
    };

    // Aplicar filtro si no es 'todos'
    let filtered = mapped;
    if (opts.estado && opts.estado !== 'todos') {
        filtered = mapped.filter((r) => {
            if (opts.estado === 'agotado') return r.estado === 'agotado';
            if (opts.estado === 'bajo_minimo') return r.estado === 'bajo_minimo';
            return r.estado === 'ok';
        });
    }

    return {
        items: filtered.slice(0, take),
        resumen,
    };
};
