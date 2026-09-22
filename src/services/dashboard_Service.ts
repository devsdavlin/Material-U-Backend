import { prisma } from '../config/db.js';
import type { AuthUser } from '../types/express.js';
import { getWarehouseId, toNumber } from './movement_common.js';
import { calcEstado } from './inventory_Service.js';

// Tablero del ALMACENISTA: todo de MI sede en una sola llamada.
// - resumen: 4 numeritos (total, con stock, agotados, bajo mínimo).
// - criticos: lo agotado + bajo mínimo (máx 10) para actuar rápido.
// - ultimosMovimientos: últimas entradas y salidas mezcladas (máx 10).
// El admin puede pasar ?warehouse_id= para ver una sede puntual.

interface CachedDashboard {
    data: DashboardResponse;
    expiresAt: number;
}

export interface DashboardResponse {
    sede: { id_warehouse: number; warehouse_name: string };
    resumen: {
        total: number;
        con_stock: number;
        agotados: number;
        bajo_minimo: number;
    };
    criticos: Array<{
        material_id: number;
        material_name: string;
        internal_code: string | null;
        unit: string;
        current_stock: number;
        min_stock: number;
        estado: 'agotado' | 'bajo_minimo' | 'ok';
    }>;
    ultimosMovimientos: Array<{
        tipo: 'entrada' | 'salida';
        numero: string;
        fecha: Date | null;
        material_name: string;
        internal_code: string | null;
        quantity: number;
        total_value: number;
    }>;
}

const DASHBOARD_CACHE_TTL_MS = 30 * 1000; // 30 segundos
const dashboardCache = new Map<number, CachedDashboard>();

export const invalidateDashboardCache = (warehouseId?: number) => {
    if (warehouseId !== undefined) {
        dashboardCache.delete(warehouseId);
    } else {
        dashboardCache.clear();
    }
};

export const getMyDashboard = async (
    user: AuthUser | undefined,
    opts: { warehouse_id?: number | undefined } = {},
): Promise<DashboardResponse> => {
    const warehouse_id = getWarehouseId(user, opts.warehouse_id);

    // Revisar caché en memoria
    const now = Date.now();
    const cached = dashboardCache.get(warehouse_id);
    if (cached && cached.expiresAt > now) {
        return cached.data;
    }

    const [warehouse, rows, entries, exits] = await Promise.all([
        prisma.warehouse.findUnique({
            where: { id_warehouse: warehouse_id },
            select: { id_warehouse: true, warehouse_name: true },
        }),
        prisma.inventory.findMany({
            where: { warehouse_id },
            include: {
                materials: {
                    select: {
                        id_material: true,
                        material_name: true,
                        internal_code: true,
                        unit: true,
                    },
                },
            },
        }),
        prisma.entries.findMany({
            where: { warehouse_id },
            include: {
                materials: { select: { material_name: true, internal_code: true } },
            },
            orderBy: { id_entry: 'desc' },
            take: 10,
        }),
        prisma.exits.findMany({
            where: { warehouse_id },
            include: {
                materials: { select: { material_name: true, internal_code: true } },
            },
            orderBy: { id_exit: 'desc' },
            take: 10,
        }),
    ]);

    const items = rows.map((r) => {
        const stock = toNumber(r.current_stock);
        const min = toNumber(r.min_stock);
        return {
            material_id: r.material_id,
            material_name: r.materials.material_name,
            internal_code: r.materials.internal_code,
            unit: r.materials.unit,
            current_stock: stock,
            min_stock: min,
            estado: calcEstado(stock, min),
        };
    });

    const resumen = {
        total: items.length,
        con_stock: items.filter((i) => i.estado === 'ok').length,
        agotados: items.filter((i) => i.estado === 'agotado').length,
        bajo_minimo: items.filter((i) => i.estado === 'bajo_minimo').length,
    };

    const criticos = items
        .filter((i) => i.estado !== 'ok')
        .sort((a, b) => a.current_stock - b.current_stock)
        .slice(0, 10);

    const ultimosMovimientos = [
        ...entries.map((e) => ({
            tipo: 'entrada' as const,
            numero: e.entry_number,
            fecha: e.entry_date,
            material_name: e.materials.material_name,
            internal_code: e.materials.internal_code,
            quantity: toNumber(e.quantity),
            total_value: toNumber(e.total_value),
        })),
        ...exits.map((x) => ({
            tipo: 'salida' as const,
            numero: x.exit_number,
            fecha: x.exit_date,
            material_name: x.materials.material_name,
            internal_code: x.materials.internal_code,
            quantity: toNumber(x.quantity),
            total_value: toNumber(x.total_value),
        })),
    ]
        .sort(
            (a, b) =>
                new Date(b.fecha ?? 0).getTime() - new Date(a.fecha ?? 0).getTime(),
        )
        .slice(0, 10);

    const response: DashboardResponse = {
        sede: warehouse
            ? { id_warehouse: warehouse.id_warehouse, warehouse_name: warehouse.warehouse_name }
            : { id_warehouse: warehouse_id, warehouse_name: '' },
        resumen,
        criticos,
        ultimosMovimientos,
    };

    // Guardar en caché
    dashboardCache.set(warehouse_id, {
        data: response,
        expiresAt: now + DASHBOARD_CACHE_TTL_MS,
    });

    return response;
};
