import { Department } from "../../generated/prisma/enums";

export interface EmployeeResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    department: Department;
    designation: string | null;
    email: string;
    mobile: string;
}

// export interface Emplpoy