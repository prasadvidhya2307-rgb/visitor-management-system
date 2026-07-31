import z from "zod";
import { createVisitSchema, updateVisitSchema } from "./visit.validation.js";
import { VisitPurpose, VisitStatus } from "../../generated/prisma/enums";
import { VisitorResponseDto } from "../visitors/visitor.types.js";
import { EmployeeResponseDto } from "../employee/employee.types.js";

export type CreateVisitDto = z.infer<typeof createVisitSchema>
export type UpdateVisitDto = z.infer<typeof updateVisitSchema>

/**
 * node to frontend reponse contarct 
 */
export interface VisitResponseDto {
    id: string;
    purpose: VisitPurpose;
    floor: number;
    notes: string | null;
    status: VisitStatus;
    checkInAt: Date;
    checkOutAt: Date | null;
    createdAt: Date | null
    updatedAt: Date | null
}