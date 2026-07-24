import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({
    path: path.resolve(process.cwd(), "../../.env")
})

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]),
    PORT: z.coerce.number(),
    DATABASE_URL: z.string().min(1),
    FASTAPI_URL: z.url(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string()
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error("❌ Invalid environment variables");
    console.error(parsed.error);
    process.exit(1)
}

export const env = parsed.data