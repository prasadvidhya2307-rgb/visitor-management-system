import { z } from "zod";

import {
    changePasswordSchema,
    loginSchema,
} from "./auth.validation.js";

export type LoginDto = z.infer<typeof loginSchema>;

export type ChangePasswordDto = z.infer<
    typeof changePasswordSchema
>;

export interface AdminResponseDto {
    id: string;
    email: string;
    profileImageId: string | null;
}

export interface LoginResponseDto {
    admin: AdminResponseDto;
    accessToken: string;
}