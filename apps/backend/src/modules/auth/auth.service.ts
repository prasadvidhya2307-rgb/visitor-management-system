// import { Admin } from "@prisma/client";

// import { AppError } from "../../utils/app-error.js";
// import {
//     comparePassword,
//     hashPassword,
// } from "../../utils/password.js";

// import { AuthRepository } from "./auth.repository.js";
// import {
//     ChangePasswordDto,
//     LoginDto,
//     LoginResponseDto,
// } from "./auth.types.js";
// import { generateAccessToken } from "./jwt.js";

// export class AuthService {
//     constructor(
//         private readonly authRepository: AuthRepository,
//     ) {}

//     public async login(
//         dto: LoginDto,
//     ): Promise<LoginResponseDto> {
//         const admin =
//             await this.authRepository.getAdminByEmail(
//                 dto.email,
//             );

//         if (!admin) {
//             throw new AppError(
//                 "Invalid email or password.",
//                 401,
//             );
//         }

//         const isPasswordValid =
//             await comparePassword(
//                 dto.password,
//                 admin.passwordHash,
//             );

//         if (!isPasswordValid) {
//             throw new AppError(
//                 "Invalid username or password.",
//                 401,
//             );
//         }

//         const accessToken =
//             generateAccessToken(admin.id);

//         return {
//             admin,
//             accessToken,
//         };
//     }

//     public async getCurrentAdmin(
//         adminId: string,
//     ): Promise<Admin> {
//         const admin =
//             await this.authRepository.getAdminById(
//                 adminId,
//             );

//         if (!admin) {
//             throw new AppError(
//                 "Admin not found.",
//                 404,
//             );
//         }

//         return admin;
//     }

//     public async changePassword(
//         adminId: string,
//         dto: ChangePasswordDto,
//     ): Promise<void> {
//         const admin =
//             await this.getCurrentAdmin(adminId);

//         const isPasswordValid =
//             await comparePassword(
//                 dto.oldPassword,
//                 admin.passwordHash,
//             );

//         if (!isPasswordValid) {
//             throw new AppError(
//                 "Old password is incorrect.",
//                 400,
//             );
//         }

//         const passwordHash =
//             await hashPassword(dto.newPassword);

//         await this.authRepository.updatePassword(
//             admin.id,
//             passwordHash,
//         );
//     }
// }