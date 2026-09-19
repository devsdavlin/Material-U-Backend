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

export const updateMaterialSchema = createMaterialSchema.partial();

export type UpdateMaterialType = z.infer<typeof updateMaterialSchema>;

export const materialIdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: "El ID del material debe ser un entero positivo" }),
});

export type MaterialIdParamType = z.infer<typeof materialIdParamSchema>;
