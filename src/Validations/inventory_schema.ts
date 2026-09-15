import { z } from "zod";
import { inventoryRules } from "./rules_Inventory.js";

export const createInventorySchema = z.object({
  warehouse_id: inventoryRules.warehouseIdRule,
  material_id: inventoryRules.materialIdRule,
  current_stock: inventoryRules.currentStockRule,
  min_stock: z.number().min(0).optional().default(0),
});

export type CreateInventoryType = z.infer<typeof createInventorySchema>;
