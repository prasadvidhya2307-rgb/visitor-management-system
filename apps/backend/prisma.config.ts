import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",

    migrations: {
        path: "prisma/migrations",
    },

    datasource: {
        url: "postgresql://postgres:12345@postgres:5432/visitor_management",
    },
});