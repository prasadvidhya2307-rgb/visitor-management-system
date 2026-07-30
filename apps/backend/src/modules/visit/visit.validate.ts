import { z } from "zod";

export const createVisitSchema = z
    .object({
        hostEmployeeId: z.uuid(),
        purpose: z.enum([
            "TECHNICAL_DISCUSSION",
            "INTERVIEW",
            "BUSINESS_MEETING",
            "CONTRACT_NEGOTIATION",
            "DESIGN_REVIEW",
            "TRAINING",
            "AUDIT",
            "DELIVERY",
            "MAINTENANCE",
            "OTHER",
        ]),

        floor: z
            .number({
                error: "Floor must be a number.",
            })
            .int("Floor must be an integer.")
            .min(0, "Floor cannot be negative."),

        notes: z
            .string()
            .trim()
            .max(500, "Notes cannot exceed 500 characters.")
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (
            data.purpose === "OTHER" &&
            (!data.notes || data.notes.trim().length === 0)
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["notes"],
                message: "Notes are required when purpose is OTHER.",
            });
        }
    });
