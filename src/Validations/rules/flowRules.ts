import {z} from "zod"; 

export const createEntrySchema = z.object({
  entry_number: z.string().min(1, "El número de entrada/remisión es obligatorio"),// numero de entrada
  internal_code: z.string().min(1, "El código interno del material es obligatorio"), // Recibes el texto del código
  provider: z.string().optional(),//provedor
  quantity: z.number().positive("La cantidad debe ser mayor a 0"),// cantidad de material ingresado
  unit_value: z.number().nonnegative("El valor unitario no puede ser negativo")
});

export const createExitSchema = z.object({
  exit_number: z.string().min(1, "El número de salida o vale es obligatorio"),
  internal_code: z.string().min(1, "El código interno del material es obligatorio"),
  cost_center: z.string().min(1, "El centro de costos (destino en obra) es obligatorio"),
  quantity: z.number().positive("La cantidad debe ser mayor a 0"),
  unit_value: z.number().nonnegative("El valor unitario no puede ser negativo")
});
