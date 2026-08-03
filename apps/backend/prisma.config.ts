import { defineConfig, env } from "prisma/config";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

if (!process.env.DATABASE_URL) {
  const target =
    process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";

  let dir = path.resolve(import.meta.dirname);
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, target);
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "node dist/prisma/seed.js" },
  datasource: { url: env("DATABASE_URL") },
});