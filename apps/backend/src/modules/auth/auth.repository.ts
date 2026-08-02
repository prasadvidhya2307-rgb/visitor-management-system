import {
    Admin,
    PrismaClient,
    Prisma,
} from "@prisma/client";

export class AuthRepository {
    constructor(
        private readonly prisma: PrismaClient,
    ) {}

    public async getAdmin(
        tx?: Prisma.TransactionClient,
    ): Promise<Admin | null> {
        return (tx ?? this.prisma).admin.findFirst();
    }

    public async getAdminById(
        adminId: string,
        tx?: Prisma.TransactionClient,
    ): Promise<Admin | null> {
        return (tx ?? this.prisma).admin.findUnique({
            where: {
                id: adminId,
            },
        });
    }

    public async getAdminByEmail(
        email: string,
        tx?: Prisma.TransactionClient,
    ): Promise<Admin | null> {
        return (tx ?? this.prisma).admin.findUnique({
            where: {
                email,
            },
        });
    }

    public async updatePassword(
        adminId: string,
        passwordHash: string,
        tx?: Prisma.TransactionClient,
    ): Promise<Admin> {
        return (tx ?? this.prisma).admin.update({
            where: {
                id: adminId,
            },
            data: {
                passwordHash,
            },
        });
    }

    public async updateProfileImage(
        adminId: string,
        profileImageId: string,
        tx?: Prisma.TransactionClient,
    ): Promise<Admin> {
        return (tx ?? this.prisma).admin.update({
            where: {
                id: adminId,
            },
            data: {
                profileImageId,
            },
        });
    }
}