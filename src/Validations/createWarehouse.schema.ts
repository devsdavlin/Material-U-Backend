import { z } from "zod";
import { warehouseRules } from "./rules.js";

export const createWarehouseSchema = z.object({
  warehouse_name: warehouseRules.warehouse_creation,
  activo: warehouseRules.activo,
});

export type CreateWarehouseType = z.infer<typeof createWarehouseSchema>;