import { prisma } from "./prisma"

export const connectDb = async (): Promise<void> => {
    await prisma.$connect()
    console.log("database conncted successfully");
}
