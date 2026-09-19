import { z } from "zod";
import { createExitSchema } from "./rules/flowRules.js";

// Body del formulario: lo que manda el frontend (del desplegable sale internal_code).
// material_id se resuelve en backend desde internal_code,
// warehouse_id y user_id salen de req.user (auth),
// total_value lo calcula el backend (quantity * unit_value).
export const exitSchema = createExitSchema;

export type CreateExitType = z.infer<typeof exitSchema>;
