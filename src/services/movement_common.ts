import { prisma } from '../config/db.js';
import type { AuthUser } from '../types/express.js';
import { UnauthorizedError, BadRequestError, NotFoundError } from '../utils/errors.js';

// Ayudas compartidas por entradas y salidas para no repetir lógica.

export const getPrismaCode = (error: unknown): string | undefined => {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
        return undefined;
    }
    const code = (error as { code: unknown }).code;
    return typeof code === 'string' ? code : undefined;
};

// Sede de quien registra o consulta. Toda entrada/salida queda atada a una sede.
export const getWarehouseId = (user: AuthUser | undefined, explicitWarehouseId?: number): number => {
    if (!user) {
        throw new UnauthorizedError('Usuario no autenticado');
    }
    // Si el usuario es Almacenista, siempre debe usar su sede asignada
    if (user.rol === 'Almacenista') {
        if (!user.warehouse_id) {
            throw new BadRequestError('El almacenista no tiene una sede asignada');
        }
        return user.warehouse_id;
    }
    // Si es Administrador: si se pasa una sede explícita la usa; si no, su sede asignada si tiene una
    if (explicitWarehouseId && Number.isInteger(explicitWarehouseId) && explicitWarehouseId > 0) {
        return explicitWarehouseId;
    }
    if (user.warehouse_id) {
        return user.warehouse_id;
    }
    throw new BadRequestError('Debe especificar el ID de sede (warehouse_id) para esta operación');
};

// Busca el producto en el catálogo global por su código.
export const findMaterialByInternalCode = async (internal_code: string) => {
    const material = await prisma.materials.findUnique({
        where: { internal_code },
    });
    if (!material) {
        throw new NotFoundError('Material no encontrado');
    }
    if (material.activo === false) {
        throw new BadRequestError('Material inactivo');
    }
    return material;
};

// 2 decimales para que coincida con Decimal(10,2) / Decimal(12,2).
export const round2 = (value: number): number => Math.round(value * 100) / 100;

// Prisma devuelve Decimal como objeto; esto lo deja como número para el frontend.
export const toNumber = (value: unknown): number => Number(value);
