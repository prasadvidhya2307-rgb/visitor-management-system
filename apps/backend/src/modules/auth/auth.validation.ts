import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .email("Invalid email address.")
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters."),
});

export const changePasswordSchema = z
    .object({
        oldPassword: z
            .string()
            .min(8, "Old password must be at least 8 characters."),

        newPassword: z
            .string()
            .min(8, "New password must be at least 8 characters."),
    })
    .refine(
        (data) => data.oldPassword !== data.newPassword,
        {
            message: "New password must be different from the old password.",
            path: ["newPassword"],
        },
    );