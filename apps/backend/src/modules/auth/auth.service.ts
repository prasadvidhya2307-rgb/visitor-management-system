import { Admin } from "@prisma/client";

import { AuthRepository } from "./auth.repository.js";
import {
    AdminResponseDto,
    ChangePasswordDto,
    LoginDto,
    LoginResponseDto,
    UpdateProfileDto,
} from "./auth.types.js";

import {
    comparePassword,
    hashPassword,
} from "../../utils/password.js";

import { AppError } from "../../utils/app-error.js";
import { MediaService } from "../media/media.service.js";

import {
    generateAccessToken,
} from "./jwt.js";

export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly mediaService: MediaService,
    ) {}

    public async login(
        dto: LoginDto,
    ): Promise<LoginResponseDto> {
        const admin =
            await this.authRepository.getAdminByEmail(
                dto.email,
            );

        if (!admin) {
            throw new AppError(
                "Invalid email or password.",
                401,
            );
        }

        const isPasswordValid =
            await comparePassword(
                dto.password,
                admin.passwordHash,
            );

        if (!isPasswordValid) {
            throw new AppError(
                "Invalid email or password.",
                401,
            );
        }

        const accessToken =
            generateAccessToken(
                admin.id,
            );

        return {
            admin: this.toResponseDto(admin),
            accessToken,
        };
    }

    public async getCurrentAdmin(
        adminId: string,
    ): Promise<AdminResponseDto> {
        const admin =
            await this.findAdminById(
                adminId,
            );

        return this.toResponseDto(
            admin,
        );
    }

    public async changePassword(
        adminId: string,
        dto: ChangePasswordDto,
    ): Promise<void> {
        const admin =
            await this.findAdminById(
                adminId,
            );

        const isPasswordValid =
            await comparePassword(
                dto.oldPassword,
                admin.passwordHash,
            );

        if (!isPasswordValid) {
            throw new AppError(
                "Old password is incorrect.",
                400,
            );
        }

        const passwordHash =
            await hashPassword(
                dto.newPassword,
            );

        await this.authRepository.updatePassword(
            admin.id,
            passwordHash,
        );
    }

    public async updateProfile(adminId: string, dto: UpdateProfileDto): Promise<AdminResponseDto> {
        await this.findAdminById(adminId);
        return this.toResponseDto(await this.authRepository.updateProfile(adminId, dto));
    }

    public async updateProfileImage(adminId: string, image: Express.Multer.File): Promise<AdminResponseDto> {
        await this.findAdminById(adminId);
        const media = await this.mediaService.createTemporary(image);
        const admin = await this.authRepository.updateProfileImage(adminId, media.id);
        await this.mediaService.markActive(media.id);
        return this.toResponseDto(admin);
    }

    private async findAdminById(
        adminId: string,
    ): Promise<Admin> {
        const admin =
            await this.authRepository.getAdminById(
                adminId,
            );

        if (!admin) {
            throw new AppError(
                "Admin not found.",
                404,
            );
        }

        return admin;
    }

    private toResponseDto(
        admin: Admin,
    ): AdminResponseDto {
        return {
            id: admin.id,
            email: admin.email,
            profileImageId:
                admin.profileImageId,
            fullName: admin.fullName,
            designation: admin.designation,
            mobile: admin.mobile,
        };
    }
}
