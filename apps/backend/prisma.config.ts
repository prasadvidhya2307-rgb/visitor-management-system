import "dotenv/config";

import { defineConfig, env } from "prisma/config";

// console.log("DATABASE_URL =", process.env.DATABASE_URL);

export default defineConfig({
    schema: "prisma/schema.prisma",

    migrations: {
        path: "prisma/migrations",
    },

    datasource: {
        url: "postgresql://postgres:postgres@postgress:5432/visitor_management",
    },
});