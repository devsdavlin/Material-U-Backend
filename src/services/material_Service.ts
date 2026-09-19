import { prisma } from '../config/db.js';
import { type CreateMaterialType, type UpdateMaterialType } from '../Validations/materials_schema.js';

const getPrismaCode = (error: unknown): string | undefined => {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
        return undefined;
    }
    const code = (error as { code: unknown }).code;
    return typeof code === 'string' ? code : undefined;
};

export const createMaterial = async (materialData: CreateMaterialType) => {
    try {
        const { internal_code, ...rest } = materialData;
        const material = await prisma.materials.create({
            data: {
                ...rest,
                ...(internal_code !== undefined && { internal_code }),
            }
        })
        return material;
    } catch (error) {
        if (getPrismaCode(error) === 'P2002') {
            throw new Error('Código interno duplicado');
        }
        console.error('Error al crear el material:', error);
        throw new Error('Error al crear el material');
    }
};

export const updateMaterial = async (id: number, patch: UpdateMaterialType) => {
    try {
        const { material_name, category, unit, activo, internal_code } = patch;
        const data = {
            ...(material_name !== undefined && { material_name }),
            ...(category !== undefined && { category }),
            ...(unit !== undefined && { unit }),
            ...(activo !== undefined && { activo }),
            ...(internal_code !== undefined && { internal_code }),
        };
        if (Object.keys(data).length === 0) {
            throw new Error('Sin cambios para actualizar');
        }
        const material = await prisma.materials.update({
            where: { id_material: id },
            data,
        });
        return material;
    } catch (error) {
        const code = getPrismaCode(error);
        if (code === 'P2025') {
            throw new Error('Material no encontrado');
        }
        if (code === 'P2002') {
            throw new Error('Código interno duplicado');
        }
        if (error instanceof Error && (error.message === 'Material no encontrado' || error.message === 'Sin cambios para actualizar')) {
            throw error;
        }
        console.error('Error al actualizar el material:', error);
        throw new Error('Error al actualizar el material');
    }
};

export const searchMaterials = async (query: string, limit = 10) => {
    try {
        const q = query.trim();
        if (!q) {
            return [];
        }
        const take = Math.min(Math.max(limit, 1), 50);
        const materials = await prisma.materials.findMany({
            where: {
                activo: true,
                OR: [
                    { material_name: { contains: q, mode: 'insensitive' } },
                    { internal_code: { contains: q, mode: 'insensitive' } },
                    { category: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: {
                id_material: true,
                material_name: true,
                internal_code: true,
                unit: true,
                category: true,
            },
            orderBy: { material_name: 'asc' },
            take,
        });
        return materials;
    } catch (error) {
        console.error('Error al buscar materiales:', error);
        throw new Error('Error al buscar materiales');
    }
};

export const setMaterialActivo = async (id: number, activo: boolean) => {
    try {
        const material = await prisma.materials.update({
            where: { id_material: id },
            data: { activo },
        })
        return material;
    } catch (error) {
        if (getPrismaCode(error) === 'P2025') {
            throw new Error('Material no encontrado');
        }
        console.error('Error al actualizar el estado del material:', error);
        throw new Error('Error al actualizar el estado del material');
    }
}
