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
    .email("Correo inválido")
    .endsWith("@gmail.com", {
        message: "Debes usar un correo de Gmail",
        })
    .transform(email => email.toLowerCase()),
    //schema password
    passrule: z
    .string().min(12, {message: "La contraseña debe tener al menos 6 caracteres"})
    .max(128, {message: "La contraseña debe tener como máximo 128 caracteres"})
}
