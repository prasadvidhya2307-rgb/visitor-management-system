import { z } from "zod";

import {
    changePasswordSchema,
    loginSchema,
    updateProfileSchema,
} from "./auth.validation.js";

export type LoginDto = z.infer<typeof loginSchema>;

export type ChangePasswordDto = z.infer<
    typeof changePasswordSchema
>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export interface AdminResponseDto {
    id: string;
    email: string;
    profileImageId: string | null;
    fullName: string | null;
    designation: string | null;
    mobile: string | null;
}

export interface LoginResponseDto {
    admin: AdminResponseDto;
    accessToken: string;
}
