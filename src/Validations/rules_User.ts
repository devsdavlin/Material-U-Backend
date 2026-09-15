import {z} from "zod";

export const userRules = {

    //schema username
    usernamerule: z
    .string().min(3, {message: "El Nombre de usuario debe tener al menos 3 caracteres"})
    .max(20, {message: "El Nombre de usuario debe tener como máximo 20 caracteres"})
    .regex(/^[a-zA-Z0-9_]+$/, {message: "El Nombre de usuario solo puede contener letras, números y guiones bajos"}),

    //Schema email
    emailSchema: z
    .string()
    .trim()
    .toLowerCase()
    .email("Correo inválido")
    .endsWith("@gmail.com", {
        message: "Debes usar un correo de Gmail",
        }),
    
    //schema password
    passrule: z
    .string().min(8, {message: "La contraseña debe tener al menos 8 caracteres"})
    .max(128, {message: "La contraseña debe tener como máximo 128 caracteres"}),

    //schema rol
    rolrule: z
    .enum(['Administrador', 'Almacenista'], {
        message: "El rol es obligatorio"
    }),

    // schema warehouse
    warehouserule_login: z
    .number().int().positive({ message: "El ID del almacén debe ser un número entero" })
}

export const warehouseRules = {
    //schema warehouse creation
    warehouse_creation: z
    .string({ message: "El nombre de la sede es obligatorio" })
    .min(3, "El nombre de la sede debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres")
    .trim(),
    
  activo: z
    .boolean()
    .optional()
    .default(true)
};


