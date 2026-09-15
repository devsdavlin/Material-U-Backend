import { z } from "zod";
import { createExitSchema } from "./rules_flow_materials.js";

export const exitSchema = createExitSchema.extend({
  warehouse_id: z.number().int().positive("El ID de la sede es obligatorio"),
  material_id: z.number().int().positive("El ID del material es obligatorio"),
  user_id: z.number().int().positive("El ID del usuario es obligatorio"),
  total_value: z.number().nonnegative("El valor total no puede ser negativo"),
});

export type CreateExitType = z.infer<typeof exitSchema>;
