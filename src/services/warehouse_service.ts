import { prisma } from '../config/db.js';
import {type CreateWarehouseType} from '../Validations/createWarehouse_schema.js';
import { AppError, BadRequestError, ConflictError, NotFoundError } from '../utils/errors.js';

export const createWarehouse = async (warehouseData: CreateWarehouseType) => {
        const existing = await prisma.warehouse.findFirst({
            where: {warehouse_name: warehouseData.warehouse_name}
        })
            if(existing){
                throw new ConflictError('Esta sede ya existe');
            }
        const warehouse_create = await prisma.warehouse.create({
            data: {warehouse_name: warehouseData.warehouse_name}
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

