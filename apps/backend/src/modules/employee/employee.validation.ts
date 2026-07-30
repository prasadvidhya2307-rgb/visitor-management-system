import { Department } from "../../generated/prisma/client";
import { z } from "zod";

export const createEmployeeSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(1, "First name is required.")
        .max(100),

    lastName: z
        .string()
        .trim()
        .min(1, "Last name is required.")
        .max(100),

    department: z.enum(Department),

    designation: z
        .string()
        .trim()
        .max(100)
        .optional(),

    email: z
        .email("Invalid email address.")
        .trim()
        .toLowerCase(),

    mobile: z
        .string()
        .trim()
        .regex(
            /^[6-9]\d{9}$/,
            "Invalid mobile number.",
        ),
});

export const updateEmployeeSchema =
    createEmployeeSchema.partial();