import { PrismaClient, VisitStatus } from "@prisma/client";

export class DashboardRepository {
    constructor(
        private readonly prisma: PrismaClient,
    ) { }

    public async getTotalVisitors(): Promise<number> {
        return this.prisma.visitor.count({
            where: {
                isDeleted: false,
            },
        });
    }

    public async getTodayCheckIns(start: Date, end: Date): Promise<number> {
        return this.prisma.visit.count({
            where: {
                checkInAt: {
                    gte: start,
                    lt: end,
                },
            },
        });
    }

    public async getTodayCheckOuts(start: Date, end: Date): Promise<number> {
        return this.prisma.visit.count({
            where: {
                checkOutAt: {
                    gte: start,
                    lt: end,
                },
            },
        });
    }

    public async getActiveVisitors(): Promise<number> {
        return this.prisma.visit.count({
            where: {
                status: VisitStatus.CHECKED_IN,
            },
        });
    }

    // public async getRecentActivities(limit = 10) {
    //     return this.prisma.visit.findMany({
    //         take: limit,
    //         orderBy: {
    //             updatedAt: "desc",
    //         },
    //         include: {
    //             visitor: {
    //                 select: {
    //                     id: true,
    //                     visitorCode: true,
    //                     firstName: true,
    //                     lastName: true,
    //                 },
    //             },
    //             hostEmployee: {
    //                 select: {
    //                     id: true,
    //                     firstName: true,
    //                     lastName: true,
    //                 },
    //             },
    //         },
    //     });
    // }
}