import dotenv from "dotenv";
dotenv.config();
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import pg from 'pg';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import * as schema from "@shared/schema";

const { Pool: PgPool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Detect if this is a Neon connection or local PostgreSQL
const isNeonConnection = process.env.DATABASE_URL.includes('neon.tech') || 
                         process.env.DATABASE_URL.includes('neon.database');

export const db = isNeonConnection 
  ? (() => {
      neonConfig.webSocketConstructor = ws;
      const pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
      return drizzleNeon({ client: pool, schema });
    })()
  : (() => {
      const isRdsHost = /rds\.amazonaws\.com/.test(process.env.DATABASE_URL || "");
      const sslModeEnv = (process.env.PGSSLMODE || process.env.SSLMODE || "").toLowerCase();
      const sslRequired = isRdsHost || sslModeEnv === "require" || sslModeEnv === "verify-full" || /sslmode=require/.test(process.env.DATABASE_URL || "");

      // Parse connection string to get individual components
      const url = new URL(process.env.DATABASE_URL);
      const pool = new PgPool({
        host: url.hostname,
        port: parseInt(url.port || '5432'),
        database: url.pathname.slice(1),  // remove leading '/'
        user: url.username,
        password: url.password,
        ssl: { rejectUnauthorized: false }
      });
      return drizzle({ client: pool, schema });
    })();
