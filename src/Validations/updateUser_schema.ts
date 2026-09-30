import { z } from "zod";
import { userRules } from "./rules/userRules.js";

// Todos los campos son opcionales: solo se cambia lo que se envía.
export const updateUserSchema = z
  .object({
    username: userRules.usernamerule.optional(),
    email: userRules.emailSchema.optional(),
    password: userRules.passrule.optional(),
    warehouse_id: userRules.warehouserule_login.optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Envía al menos un campo para actualizar",
  });

export type UpdateUserType = z.infer<typeof updateUserSchema>;
