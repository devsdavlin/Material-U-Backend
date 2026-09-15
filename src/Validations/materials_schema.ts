import { z } from "zod";
import { materialsRules } from "./rules/inventoryRules.js";

export const createMaterialSchema = z.object({
  material_name: materialsRules.MaterialNameRule,
  category: materialsRules.CategoryRule,
  unit: materialsRules.unitRule,
  activo: materialsRules.activeRule,
  internal_code: materialsRules.internalCodeRule.optional(),
});

export type CreateMaterialType = z.infer<typeof createMaterialSchema>;
