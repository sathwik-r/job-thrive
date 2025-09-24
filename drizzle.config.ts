import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const db_host = process.env.DATABASE_URL.split('@')[1].split(':')[0];

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: db_host,
    port: 5432,
    database: 'jobthrive',
    user: 'postgres',
    password: process.env.DATABASE_PASSWORD,
    ssl: { rejectUnauthorized: false }
  },
});