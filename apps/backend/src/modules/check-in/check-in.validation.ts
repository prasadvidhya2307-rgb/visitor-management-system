import z from "zod";
import { createVisitorSchema } from "../visitors/visitor.validation";
import { createVisitSchema } from "../visit/visit.validation";

export const checkInSchema = z.object({
    visitor: createVisitorSchema,
    visit: createVisitSchema
});