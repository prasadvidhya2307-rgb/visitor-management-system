import z from "zod";
import { createVisitorSchema } from "../visitors/visitor.validation.js";
import { createVisitSchema } from "../visit/visit.validation.js";

export const checkInSchema = z.object({
    visitor: createVisitorSchema,
    visit: createVisitSchema
});