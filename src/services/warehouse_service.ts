import { prisma } from '../config/db.js';
import {type CreateWarehouseType} from '../Validations/createWarehouse_schema.js';
import { AppError, BadRequestError, ConflictError, NotFoundError } from '../utils/errors.js';

export const createWarehouse = async (warehouseData: CreateWarehouseType) => {
        // Compara sin importar mayúsculas/minúsculas ("La Vega" == "la vega")
        const nombre = warehouseData.warehouse_name.trim();
        const existing = await prisma.warehouse.findFirst({
            where: {warehouse_name: {equals: nombre, mode: 'insensitive'}}
        })
            if(existing){
                throw new ConflictError('Esta sede ya existe');
            }
        const warehouse_create = await prisma.warehouse.create({
            data: {warehouse_name: nombre}
        });
        return warehouse_create
}

export const find_warehouse = async () => {
        const findware = await prisma.warehouse.findMany({
            select: {id_warehouse: true, warehouse_name: true, activo: true},
            orderBy: {warehouse_name: 'asc'}
        })
        return findware
} 

