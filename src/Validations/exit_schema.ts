import { z } from "zod";
import { createExitSchema } from "./rules/flowRules.js";

export const exitSchema = createExitSchema;

export type CreateExitType = z.infer<typeof exitSchema>;
