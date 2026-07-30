import z from "zod";
import { createVisitSchema, updateVisitSchema } from "./visit.validation";
import { VisitPurpose, VisitStatus } from "../../generated/prisma/enums";
import { VisitorResponseDto } from "../visitors/visitor.types";
import { EmployeeResponseDto } from "../employee/employee.types";

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
    checkInAt: string;
    checkOutAt: string | null;
    visitor: VisitorResponseDto;
    hostEmployee: EmployeeResponseDto;
}