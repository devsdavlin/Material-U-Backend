import { z } from "zod";
import { userRules } from "./rules.js";

export const createUserSchema = z.object({
  username: userRules.usernamerule,
  email: userRules.emailSchema,
  password: userRules.passrule,
  rol: userRules.rolrule,
  warehouse_id: userRules.warehouserule_login.optional(),
}).superRefine((data, ctx) => {
  
  if (data.rol === 'Almacenista' && !data.warehouse_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El ID de la sede es obligatorio para el rol de Almacenista",
      path: ["warehouse_id"],
    });
  }
});

export type CreateUserType = z.infer<typeof createUserSchema>;