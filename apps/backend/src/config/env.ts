import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDirectory = path.resolve(__dirname, "..", "..", "..", "..");

// Only load a local .env file if vars aren't already provided by the
// environment (e.g. injected by Docker's env_file / environment:).
if (!process.env.DATABASE_URL) {
    const envFile =
        process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";

    dotenv.config({
        path: path.join(rootDirectory, envFile),
    });
}

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]),
    PORT: z.coerce.number(),
    DATABASE_URL: z.string().min(1),
    FASTAPI_URL: z.url(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.enum([
        "1h",
        "2h",
        "8h",
        "12h",
        "1d",
        "7d",
    ]),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables");
    console.error(parsed.error);
    process.exit(1);
}

export const env = parsed.data;