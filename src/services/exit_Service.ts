import { prisma } from '../config/db.js';
import { type Prisma } from '../generated/prisma/client.js';
import { type CreateExitType } from '../Validations/exit_schema.js';
import type { AuthUser } from '../types/express.js';
import {
    getPrismaCode,
    getWarehouseId,
    findMaterialByInternalCode,
    round2,
    toNumber,
} from './movement_common.js';
import { AppError, BadRequestError, ConflictError } from '../utils/errors.js';
import { invalidateDashboardCache } from './dashboard_Service.js';
import {
    getPaginationParams,
    buildPaginatedResult,
    type PaginationParams,
    type PaginatedResult,
} from '../utils/pagination.js';

// Registra una SALIDA (sale material de la sede hacia un destino en obra).
// La persona elige el producto de la lista y escribe número,
// cantidad, precio y destino (centro de costo). El resto lo pone el sistema.
// Regla clave: no deja sacar más de lo que hay en el saldo de la sede mediante operación atómica.

export const createExit = async (
    input: CreateExitType,
    user: AuthUser | undefined,
    explicitWarehouseId?: number,
) => {
    const warehouse_id = getWarehouseId(user, explicitWarehouseId);
    const user_id = user!.id_user;

    const material = await findMaterialByInternalCode(input.internal_code);

    const quantity = input.quantity;
    const unit_value = input.unit_value;
    const total_value = round2(quantity * unit_value);

    try {
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Verificación previa de número de salida
            const existing = await tx.exits.findFirst({
                where: { warehouse_id, exit_number: input.exit_number },
                select: { id_exit: true },
            });
            if (existing) {
                throw new ConflictError('Número de salida ya registrado en esta sede');
            }

            // 2. Descuento atómico de stock (Previene condición de carrera a nivel de BD)
            const updateResult = await tx.inventory.updateMany({
                where: {
                    warehouse_id,
                    material_id: material.id_material,
                    current_stock: { gte: quantity },
                },
                data: {
                    current_stock: { decrement: quantity },
                },
            });

            if (updateResult.count === 0) {
                throw new BadRequestError('Stock insuficiente para esta salida');
            }

            // 3. Registrar el movimiento de salida
            const exit = await tx.exits.create({
                data: {
                    exit_number: input.exit_number,
                    warehouse_id,
                    material_id: material.id_material,
                    user_id,
                    cost_center: input.cost_center,
                    quantity,
                    unit_value,
                    total_value,
                    ...(input.exit_date ? { exit_date: input.exit_date } : {}),
                },
            });

            // 4. Obtener el saldo actualizado
            const stock = await tx.inventory.findUniqueOrThrow({
                where: {
                    warehouse_id_material_id: {
                        warehouse_id,
                        material_id: material.id_material,
                    },
                },
                select: { current_stock: true },
            });

            return { exit, stock };
        });

        // Invalida caché del dashboard
        invalidateDashboardCache(warehouse_id);

        return {
            exit: {
                ...result.exit,
                quantity: toNumber(result.exit.quantity),
                unit_value: toNumber(result.exit.unit_value),
                total_value: toNumber(result.exit.total_value),
            },
            material: {
                id_material: material.id_material,
                material_name: material.material_name,
                internal_code: material.internal_code,
                unit: material.unit,
            },
            current_stock: toNumber(result.stock.current_stock),
        };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        const code = getPrismaCode(error);
        if (code === 'P2002') {
            throw new ConflictError('Número de salida ya registrado en esta sede');
        }
        console.error('Error al crear la salida:', error);
        throw error;
    }
};

export interface ExitItem {
    id_exit: number;
    exit_number: string;
    warehouse_id: number;
    material_id: number;
    user_id: number;
    cost_center: string | null;
    quantity: number;
    unit_value: number;
    total_value: number;
    exit_date: Date | null;
    materials: {
        material_name: string;
        internal_code: string | null;
        unit: string;
    };
}

// Lista las salidas de la sede paginadas (las últimas primero).
export const listMyExits = async (
    user: AuthUser | undefined,
    paginationParams?: PaginationParams,
    explicitWarehouseId?: number,
    filters: { cost_center?: string | undefined } = {},
): Promise<PaginatedResult<ExitItem>> => {
    const warehouse_id = getWarehouseId(user, explicitWarehouseId);
    const params = paginationParams ?? getPaginationParams({}, 20);
    const costCenter = (filters.cost_center ?? '').trim();

    const whereClause: Prisma.exitsWhereInput = {
        warehouse_id,
        ...(costCenter
            ? { cost_center: { contains: costCenter, mode: 'insensitive' } }
            : {}),
    };

    const [total, rows] = await Promise.all([
        prisma.exits.count({ where: whereClause }),
        prisma.exits.findMany({
            where: whereClause,
            include: {
                materials: {
                    select: { material_name: true, internal_code: true, unit: true },
                },
            },
            orderBy: { id_exit: 'desc' },
            skip: params.skip,
            take: params.take,
        }),
    ]);

    const items: ExitItem[] = rows.map((r) => ({
        ...r,
        quantity: toNumber(r.quantity),
        unit_value: toNumber(r.unit_value),
        total_value: toNumber(r.total_value),
    }));

    return buildPaginatedResult(items, total, params);
};
