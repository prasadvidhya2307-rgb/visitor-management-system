import path from "node:path";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";


dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

console.log(env("DATABASE_URL"))

console.log(process.env.DATABASE_URL)

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});