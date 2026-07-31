import {
    PreRegistration,
    PreRegistrationStatus,
    RecurrenceType,
    VisitPurpose,
} from "@prisma/client";

import { EmployeeResponseDto } from "../employee/employee.types.js";
import { VisitorResponseDto } from "../visitors/visitor.types.js";

export interface CreatePreRegistrationDto {
    firstName: string;
    lastName: string;
    company?: string;
    email?: string;
    phone?: string;
    hostEmployeeId: string;
    purpose: VisitPurpose;
    floor: number;
    notes?: string;
    validFrom: Date;
    validTo: Date;
    recurrence: RecurrenceType;
}

export interface UpdatePreRegistrationDto
    extends Partial<CreatePreRegistrationDto> { }

export interface PreRegistrationResponseDto
    extends Omit<PreRegistration, "hostEmployeeId" | "visitorId"> {
    hostEmployee: EmployeeResponseDto;
    visitor: VisitorResponseDto | null;
}