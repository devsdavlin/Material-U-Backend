import { z } from "zod";
import { materialsRules } from "./inventoryRules.js";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const flowRules = {
  // N° de documento manual (DB: VarChar(50)). Se usa para entry_number y exit_number.
  documentNumberRule: (label: string) =>
    z
      .string({ message: `${label} es obligatorio` })
      .trim()
      .min(1, `${label} es obligatorio`)
      .max(50, `${label} no puede superar los 50 caracteres`),
  internalCodeRule: materialsRules.internalCodeRule,

  // DB entries/exits.quantity = Decimal(10,2) -> máx 99_999_999.99
  quantityRule: z.coerce
    .number({ message: "La cantidad debe ser un número" })
    .finite("La cantidad debe ser un número válido")
    .positive("La cantidad debe ser mayor a 0")
    .max(99999999.99, "La cantidad supera el máximo permitido"),

  // DB unit_value = Decimal(12,2) -> máx 9_999_999_999.99
  unitValueRule: z.coerce
    .number({ message: "El valor unitario debe ser un número" })
    .finite("El valor unitario debe ser un número válido")
    .nonnegative("El valor unitario no puede ser negativo")
    .max(9999999999.99, "El valor unitario supera el máximo permitido"),

  // Proveedor como texto libre (DB: VarChar(150), nullable). "" -> undefined.
  providerRule: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(150, "El proveedor no puede superar los 150 caracteres")
      .optional(),
  ),

  // Centro de costo como texto libre (DB: VarChar(150), nullable en DB
  // pero obligatorio en el formulario de salida por requerimiento).
  costCenterRule: z
    .string({ message: "El centro de costos (destino en obra) es obligatorio" })
    .trim()
    .min(1, "El centro de costos (destino en obra) es obligatorio")
    .max(150, "El centro de costos no puede superar los 150 caracteres"),

  // Fecha opcional del movimiento. Si se omite, el backend usa now().
  movementDateRule: z.coerce
    .date({ message: "Fecha inválida" })
    .optional(),
};

// Campos comunes a todo movimiento: seleccionar producto del catálogo
// + cantidad + valor unitario. total_value lo calcula el backend.
export const baseMovementSchema = z.object({
  internal_code: flowRules.internalCodeRule,
  quantity: flowRules.quantityRule,
  unit_value: flowRules.unitValueRule,
});

export const createEntrySchema = baseMovementSchema.extend({
  entry_number: flowRules.documentNumberRule("El número de entrada/remisión"),
  provider: flowRules.providerRule,
  entry_date: flowRules.movementDateRule,
});

export const createExitSchema = baseMovementSchema.extend({
  exit_number: flowRules.documentNumberRule("El número de salida o vale"),
  cost_center: flowRules.costCenterRule,
  exit_date: flowRules.movementDateRule,
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type CreateExitInput = z.infer<typeof createExitSchema>;
