import { z } from "zod";
import { createEntrySchema } from "./rules/flowRules.js";


export const entrySchema = createEntrySchema;

export type CreateEntryType = z.infer<typeof entrySchema>;
