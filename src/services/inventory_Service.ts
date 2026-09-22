import { prisma } from '../config/db.js';
import type { AuthUser } from '../types/express.js';
import { NotFoundError } from '../utils/errors.js';
import { getWarehouseId, toNumber } from './movement_common.js';

export type EstadoFiltro = 'todos' | 'agotado' | 'bajo_minimo' | 'con_stock';

const calcEstado = (stock: number, minStock: number): 'agotado' | 'bajo_minimo' | 'ok' => {
    if (stock <= 0) return 'agotado';
    if (stock < minStock) return 'bajo_minimo';
    return 'ok';
};

export { calcEstado };

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

// Detalle de UN material en mi sede: datos del catálogo + saldo +
// últimos movimientos (entradas y salidas) de ese producto.
// Si el producto nunca se movió en la sede, el saldo es 0 sin fila.
export const getMaterialDetail = async (
    user: AuthUser | undefined,
    materialId: number,
    opts: { limit?: number; warehouse_id?: number | undefined } = {},
) => {
    const warehouse_id = getWarehouseId(user, opts.warehouse_id);
    const take = Math.min(Math.max(opts.limit ?? 10, 1), 50);

    const material = await prisma.materials.findUnique({
        where: { id_material: materialId },
    });
    if (!material) {
        throw new NotFoundError('Material no encontrado');
    }

    const row = await prisma.inventory.findUnique({
        where: { warehouse_id_material_id: { warehouse_id, material_id: materialId } },
    });
    const stock = row ? toNumber(row.current_stock) : 0;
    const min = row ? toNumber(row.min_stock) : 0;

    const [entries, exits] = await Promise.all([
        prisma.entries.findMany({
            where: { warehouse_id, material_id: materialId },
            orderBy: { id_entry: 'desc' },
            take,
        }),
        prisma.exits.findMany({
            where: { warehouse_id, material_id: materialId },
            orderBy: { id_exit: 'desc' },
            take,
        }),
    ]);

    return {
        material: {
            id_material: material.id_material,
            material_name: material.material_name,
            internal_code: material.internal_code,
            unit: material.unit,
            category: material.category,
            activo: material.activo,
        },
        stock: {
            current_stock: stock,
            min_stock: min,
            estado: calcEstado(stock, min),
        },
        ultimasEntradas: entries.map((e) => ({
            ...e,
            quantity: toNumber(e.quantity),
            unit_value: toNumber(e.unit_value),
            total_value: toNumber(e.total_value),
        })),
        ultimasSalidas: exits.map((x) => ({
            ...x,
            quantity: toNumber(x.quantity),
            unit_value: toNumber(x.unit_value),
            total_value: toNumber(x.total_value),
        })),
    };
};

// Define el stock mínimo de un material en mi sede.
// Sin mínimo, el aviso de "bajo mínimo" nunca se activa.
// Si el producto aún no tiene fila en la sede, la crea con saldo 0.
export const setMinStock = async (
    user: AuthUser | undefined,
    materialId: number,
    minStock: number,
    explicitWarehouseId?: number,
) => {
    const warehouse_id = getWarehouseId(user, explicitWarehouseId);

    const material = await prisma.materials.findUnique({
        where: { id_material: materialId },
        select: { id_material: true, material_name: true, internal_code: true },
    });
    if (!material) {
        throw new NotFoundError('Material no encontrado');
    }

    const row = await prisma.inventory.upsert({
        where: { warehouse_id_material_id: { warehouse_id, material_id: materialId } },
        update: { min_stock: minStock },
        create: { warehouse_id, material_id: materialId, current_stock: 0, min_stock: minStock },
    });

    const stock = toNumber(row.current_stock);
    const min = toNumber(row.min_stock);
    return {
        material_id: materialId,
        material_name: material.material_name,
        current_stock: stock,
        min_stock: min,
        estado: calcEstado(stock, min),
    };
};
