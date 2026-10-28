import {defineConfig} from "drizzle-kit";

const migrationUrl =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;

if (migrationUrl) {
    process.env.DB_URL = migrationUrl;
}

export default defineConfig({
    dialect: "postgresql",
    schema: "./drizzle",
    out: "./migrations",
    dbCredentials: {
        url: process.env.DB_URL!
    }
})
