import {z} from "zod";
import { userRules } from "./userRules.js"; 

export const materialsRules = {

    //schema material name
    MaterialNameRule: z
    .string()
    .trim()
    .min(3, {message: "El nombre del material debe tener al menos 3 caracteres" })
    .max(150, {message: "El nombre del material debe tener como máximo 150 caracteres" }),

    //schema category
    CategoryRule: z
    .string()
    .trim()
    .min(3, {message: "La categoría debe tener al menos 3 caracteres" })
    .max(100, {message: "La categoría debe tener como máximo 100 caracteres" }),
     
    //schema unit of measure
    unitRule: z
    .string()
    .trim()
    .min(1,{message: "La unidad de medida debe tener al menos 1 caracter" })
    .max(50, {message: "La unidad de medida debe tener como máximo 50 caracteres" }),

    //schema active status
    activeRule: z
    .boolean()
    .optional()
    .default(true),

    //Internal code Rule
    internalCodeRule: z
    .string()
    .trim()
    .min(1, {message: "El código interno debe tener al menos 1 caracter" })
    .max(50, {message: "El código interno debe tener como máximo 50 caracteres" })
}

export const inventoryRules = {
     
    //reutilizar logica
    warehouseIdRule: userRules.warehouserule_login,

    // Reutilizas la misma lógica de ID para el material
    materialIdRule: z
        .number({ message: "El ID del material es obligatorio" })
        .int()
        .positive({ message: "El ID del material debe ser un entero positivo" }),

    // Lo único nuevo, validar el stock actual, que debe ser un número positivo
    currentStockRule: z
        .number({ message: "El stock actual debe ser un número" })
        .min(0, { message: "El stock actual no puede ser negativo" })
        .optional()
        .default(0)
}
