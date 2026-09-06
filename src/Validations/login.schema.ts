import { z } from "zod";
import { userRules } from "./rules.js"; 

export const loginSchema = z.object({
  email: userRules.emailSchema,
  password: z.string({ message: "La contraseña es obligatoria" }).min(1, { message: "La contraseña es obligatoria" }),
});

export type LoginType = z.infer<typeof loginSchema>;