import { z } from "zod";
import { inventoryRules } from "./rules/inventoryRules.js";

export const createInventorySchema = z.object({
  warehouse_id: inventoryRules.warehouseIdRule,
  material_id: inventoryRules.materialIdRule,
  current_stock: inventoryRules.currentStockRule,
  min_stock: z.number().min(0).optional().default(0),
});

export type CreateInventoryType = z.infer<typeof createInventorySchema>;

// Lo que manda el frontend para fijar el mínimo de un material en su sede.
// Solo el número; la sede sale de la sesión y el material de la URL.
export const updateMinStockSchema = z.object({
  min_stock: z.coerce
    .number({ message: "El stock mínimo debe ser un número" })
    .finite("El stock mínimo debe ser un número válido")
    .min(0, "El stock mínimo no puede ser negativo")
    .max(99999999999999, "El stock mínimo supera el máximo permitido"),
});

export type UpdateMinStockType = z.infer<typeof updateMinStockSchema>;
