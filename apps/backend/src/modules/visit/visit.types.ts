import z from "zod";
import { createVisitSchema } from "./visit.validate";
import { VisitPurpose, VisitStatus } from "../../generated/prisma/enums";
import { VisitorResponseDto } from "../visitors/visitor.types";
import { EmployeeResponseDto } from "../employeee/employee.types";

export type CreateVisitDto = z.infer<typeof createVisitSchema>

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