import { z } from 'zod'
import pkg from '@prisma/client'
const { IdentityType } = pkg

export const createMobileSchema = z.object({
    mobile: z
        .string()
        .trim()
        .min(10, "mobile number must be atleat 10 digits"),

    isPrimary: z.boolean()
})

export const createEmailSchema = z.object({
    email: z
        .email("not a valid email")
        .trim(),

    isPrimary: z.boolean()
})

export const createVisitorSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .max(100),

    lastName: z
        .string()
        .trim()
        .max(100)
        .optional(),

    identityType: z
        .enum(IdentityType),

    identityNumber: z
        .string()
        .trim()
        .min(3)
        .max(100),

    mobiles: z
        .array(createMobileSchema)
        .min(1, "At least one mobile number is required"),

    emails: z
        .array(createEmailSchema)
        .default([]),
})

export const updateVisitorSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .max(100)
        .optional(),

    lastName: z
        .string()
        .trim()
        .max(100)
        .optional(),

    identityType: z
        .enum(IdentityType)
        .optional(),

    identityNumber: z
        .string()
        .trim()
        .min(3)
        .max(100)
        .optional(),

    mobiles: z
        .array(createMobileSchema)
        .min(1, "At least one mobile number is required")
        .optional(),

    emails: z
        .array(createEmailSchema)
        .optional(),
})