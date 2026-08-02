import { PrismaClient, SystemSetting } from "@prisma/client";

export class SettingsRepository {
    constructor(private readonly prisma: PrismaClient) {}
    public get(): Promise<SystemSetting> {
        return this.prisma.systemSetting.upsert({ where: { id: "default" }, create: { id: "default" }, update: {} });
    }
    public update(data: Omit<SystemSetting, "id" | "createdAt" | "updatedAt">): Promise<SystemSetting> {
        return this.prisma.systemSetting.upsert({ where: { id: "default" }, create: { id: "default", ...data }, update: data });
    }
}
