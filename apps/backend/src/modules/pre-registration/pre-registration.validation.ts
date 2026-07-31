import { z } from "zod";

import {
    RecurrenceType,
    VisitPurpose,
} from "../../generated/prisma/client";

const preRegistrationSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(2)
        .max(100),

    lastName: z
        .string()
        .trim()
        .min(2)
        .max(100),

    company: z
        .string()
        .trim()
        .max(150)
        .optional(),

    email: z
        .email()
        .optional(),

    phone: z
        .string()
        .trim()
        .min(10)
        .max(20)
        .optional(),

    hostEmployeeId: z.uuid(),

    purpose: z.enum(VisitPurpose),

    floor: z
        .number()
        .int()
        .min(0),

    notes: z
        .string()
        .trim()
        .max(500)
        .optional(),

    validFrom: z.coerce.date(),

    validTo: z.coerce.date(),

    isRecurring: z.boolean(),

    recurrenceType: z.enum(RecurrenceType),
});

export const createPreRegistrationSchema =
    preRegistrationSchema.superRefine((data, ctx) => {
        if (data.validTo < data.validFrom) {
            ctx.addIssue({
                code: "custom",
                path: ["validTo"],
                message: "Valid To must be after Valid From.",
            });
        }

        if (
            data.purpose === VisitPurpose.OTHER &&
            !data.notes
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["notes"],
                message:
                    "Notes are required when purpose is OTHER.",
            });
        }
    });

export const updatePreRegistrationSchema =
    preRegistrationSchema.partial();