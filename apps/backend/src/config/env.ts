import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env file only if not already injected (e.g. by Docker env_file/environment:)
if (!process.env.DATABASE_URL) {
  const target =
    process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";

  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, target);
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  PORT: z.coerce.number(),
  DATABASE_URL: z.string().min(1),
  FASTAPI_URL: z.url(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.enum(["1h", "2h", "8h", "12h", "1d", "7d"]),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables");
  console.error(parsed.error);
  process.exit(1);
}

export const env = parsed.data;