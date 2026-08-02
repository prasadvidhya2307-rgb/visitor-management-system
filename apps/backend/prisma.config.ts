import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";
import path from "path";

if (!process.env.DATABASE_URL) {
    const rootDir = path.resolve(import.meta.dirname, "../../");
    const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
    dotenv.config({ path: path.join(rootDir, envFile) });
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts", },
    datasource: { url: env("DATABASE_URL") },
});