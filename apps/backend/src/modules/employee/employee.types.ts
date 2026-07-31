import { z } from "zod";

import {
    createEmployeeSchema,
    updateEmployeeSchema,
} from "./employee.validation.js";
import { Department } from "@prisma/client";

export type CreateEmployeeDto =
    z.infer<typeof createEmployeeSchema>;

export type UpdateEmployeeDto =
    z.infer<typeof updateEmployeeSchema>;

export interface EmployeeResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    department: Department;
    designation: string | null;
    email: string;
    mobile: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}