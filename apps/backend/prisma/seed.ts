import "dotenv/config";
import { hashPassword } from "../src/utils/password.js";
import { prisma } from '../src/database/prisma.js'

async function main() {
    const existingAdmin =
        await prisma.admin.findFirst();

    if (existingAdmin) {
        console.log(
            "Admin already exists. Skipping seed.",
        );
        return;
    }

    const passwordHash =
        await hashPassword(
            process.env.DEFAULT_ADMIN_PASSWORD!,
        );

    await prisma.admin.create({
        data: {
            email:
                process.env.DEFAULT_ADMIN_EMAIL!,
            passwordHash,
        },
    });

    console.log(
        "Admin created successfully.",
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });