import { prisma } from '../config/db.js';
import { type Prisma } from '../generated/prisma/client.js';
import { type CreateEntryType } from '../Validations/entry_schema.js';
import type { AuthUser } from '../types/express.js';
import {
    getPrismaCode,
    getWarehouseId,
    findMaterialByInternalCode,
    round2,
    toNumber,
} from './movement_common.js';
import { AppError, ConflictError } from '../utils/errors.js';

// Registra una ENTRADA (llega material a la sede).
// La persona elige el producto de la lista y escribe número,
// cantidad, precio y proveedor. El resto lo pone el sistema.

// Crea la entrada y suma el saldo de una vez (todo junto o nada).
export const createEntry = async (
    input: CreateEntryType,
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
            // No deja repetir el mismo número de documento dentro de la misma sede.
            const existing = await tx.entries.findFirst({
                where: { warehouse_id, entry_number: input.entry_number },
                select: { id_entry: true },
            });
            if (existing) {
                throw new ConflictError('Número de entrada ya registrado en esta sede');
            }

            // Guarda la entrada.
            const entry = await tx.entries.create({
                data: {
                    entry_number: input.entry_number,
                    warehouse_id,
                    material_id: material.id_material,
                    user_id,
                    provider: input.provider ?? null,
                    quantity,
                    unit_value,
                    total_value,
                    ...(input.entry_date ? { entry_date: input.entry_date } : {}),
                },
            });

            // Suma al saldo de esta sede y este producto.
            // Si es la primera vez de este producto en la sede, crea la fila.
            const stock = await tx.inventory.upsert({
                where: {
                    warehouse_id_material_id: {
                        warehouse_id,
                        material_id: material.id_material,
                    },
                },
                update: { current_stock: { increment: quantity } },
                create: {
                    warehouse_id,
                    material_id: material.id_material,
                    current_stock: quantity,
                    min_stock: 0,
                },
            });

            return { entry, stock };
        });

        return {
            entry: {
                ...result.entry,
                quantity: toNumber(result.entry.quantity),
                unit_value: toNumber(result.entry.unit_value),
                total_value: toNumber(result.entry.total_value),
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
            throw new ConflictError('Número de entrada ya registrado en esta sede');
        }
        console.error('Error al crear la entrada:', error);
        throw error;
    }
};

// Lista las entradas de la sede (las últimas primero).
export const listMyEntries = async (
    user: AuthUser | undefined,
    limit = 50,
    explicitWarehouseId?: number,
) => {
    const warehouse_id = getWarehouseId(user, explicitWarehouseId);
    const take = Math.min(Math.max(limit, 1), 100);
    const rows = await prisma.entries.findMany({
        where: { warehouse_id },
        include: {
            materials: {
                select: { material_name: true, internal_code: true, unit: true },
            },
        },
        orderBy: { id_entry: 'desc' },
        take,
    });
    return rows.map((r) => ({
        ...r,
        quantity: toNumber(r.quantity),
        unit_value: toNumber(r.unit_value),
        total_value: toNumber(r.total_value),
    }));
};
